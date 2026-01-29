'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Clock, StopCircle, LogOut, Users } from 'lucide-react';
import ProblemPanel from '@/components/room/code-editor/ProblemPanel';
import CodeEditorPanel from '@/components/room/code-editor/CodeEditorPanel';
import RightSidebar from '@/components/room/code-editor/RightSidebar';
import { useCodeExecution, useRoomQuestions, useTeamDetails, useRoomDetails } from '@/lib/api/hooks';
import { apiClient } from '@/lib/api/client';

export default function CodeEditorPage() {
  const params = useParams();
  const { id: roomId, teamId } = params;

  const [activeTab, setActiveTab] = useState('problem');
  const [activeEditor, setActiveEditor] = useState('me');
  const [code, setCode] = useState('');
  const [headerCode, setHeaderCode] = useState('');
  const [boilerplate, setBoilerplate] = useState('');
  const [definition, setDefinition] = useState('');
  const [language, setLanguage] = useState('python');

  // Cache for user code to support instant switching { "questionId_language": code }
  // Using ref to persist without re-renders, assuming we treat it as a "save state"
  const codeCache = useRef({});

  // Helper to update specific cache entry (e.g. when loading a template)
  const updateCache = (qId, lang, content) => {
    if (qId && lang) {
      codeCache.current[`${qId}_${lang}`] = content;
    }
  };

  // Right Sidebar State (Lifted)
  const [rightPanelExpanded, setRightPanelExpanded] = useState(null); // 'chat', 'team', or null
  const [rightPanelTab, setRightPanelTab] = useState('chat');

  // Real API hooks for code execution
  const {
    runCode,
    submitCode,
    isRunning,
    isSubmitting,
    runResult,
    submitResult,
    error: executionError,
    clearResults
  } = useCodeExecution();

  // Fetch real room questions and team details
  const { data: questionsData } = useRoomQuestions(roomId);
  const { data: teamData } = useTeamDetails(teamId);
  const { data: roomData } = useRoomDetails(roomId);

  // Layout State
  const [leftPanelWidth, setLeftPanelWidth] = useState(45);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Get current user ID from token safely
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setCurrentUserId(payload.id || payload.userId);
        } catch (e) {
          console.error('Failed to parse token:', e);
        }
      }
    }
  }, []);

  // --- Assignment & Socket State ---
  const [socket, setSocket] = useState(null);
  const [questionAssignments, setQuestionAssignments] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [cooldowns, setCooldowns] = useState({});

  // Sync assignments from Team Data (DB) to Local State
  useEffect(() => {
    if (teamData?.assignments) {
      const newQuestionAssignments = {};
      const newUserAssignments = {};

      teamData.assignments.forEach(assignment => {
        if (assignment.assignedTo) {
          newQuestionAssignments[assignment.questionId] = {
            userId: assignment.assignedTo.userId,
            username: assignment.assignedTo.username,
            questionTitle: assignment.questionTitle,
            status: assignment.status
          };
          newUserAssignments[assignment.assignedTo.userId] = assignment.questionId;
        }
      });

      setQuestionAssignments(prev => ({ ...prev, ...newQuestionAssignments }));
      setUserAssignments(prev => ({ ...prev, ...newUserAssignments }));
    }
  }, [teamData]);

  // Live Code Sharing - Store each team member's code
  const [teamMembersCode, setTeamMembersCode] = useState({}); // {userId: {code, language, questionId}}

  // Track which user is assigned to which question (for one-question-per-user rule)
  const [userAssignments, setUserAssignments] = useState({}); // {userId: questionId}

  // Socket Connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (!token) return;

    const newSocket = io(socketUrl, {
      auth: { token }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      if (teamId) {
        newSocket.emit('join-team', { teamId });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [teamId]);

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return;

    const handleRequestReceived = (data) => {
      setPendingRequests(prev => {
        if (prev.find(r => r.id === data.id)) return prev;
        return [...prev, data];
      });
      if (teamData?.isLeader) {
        toast(`${data.requesterName} requested assignment`, { icon: '🔔' });
        // Auto open Team Management panel for leader
        setRightPanelExpanded('team');
        setRightPanelTab('team');
      }
    };

    const handleAssignmentUpdated = (data) => {
      // Use the username from the backend response
      const name = data.assignedUserName || 'Teammate';

      setQuestionAssignments(prev => ({
        ...prev,
        [data.questionId]: {
          userId: data.assignedUserId,
          username: name,
          questionTitle: data.questionTitle,
          status: data.status
        }
      }));

      // Track user assignments (one question per user)
      setUserAssignments(prev => ({
        ...prev,
        [data.assignedUserId]: data.questionId
      }));

      // Remove from pending requests
      setPendingRequests(prev => prev.filter(req => req.questionId !== data.questionId));

      if (data.assignedUserId === currentUserId) {
        toast.success(`You have been assigned!`, { icon: '🚀', duration: 2000 });
        // Switch to the assigned question
        setSelectedQuestion(data.questionId);
      } else {
        toast.success(`${name} was assigned to a question`, { icon: '✅', duration: 2000 });
      }
    };

    const handleAssignmentRejected = (data) => {
      setPendingRequests(prev => prev.filter(req => !(req.questionId === data.questionId && req.requesterId === data.requesterId)));

      if (data.requesterId === currentUserId) {
        toast.error('Request rejected. Cooldown started.', { icon: '❌', duration: 2000 });
        setCooldowns(prev => ({ ...prev, [data.questionId]: Date.now() + 10000 }));
        setTimeout(() => {
          setCooldowns(prev => {
            const next = { ...prev };
            delete next[data.questionId];
            return next;
          });
        }, 10000);
      }
    };

    const handleCodeUpdate = (data) => {
      // Update team member's code in real-time
      setTeamMembersCode(prev => ({
        ...prev,
        [data.userId]: {
          code: data.code,
          language: data.language,
          questionId: data.questionId
        }
      }));
    };

    socket.on('assignment:request_received', handleRequestReceived);
    socket.on('assignment:updated', handleAssignmentUpdated);
    socket.on('assignment:rejected', handleAssignmentRejected);
    socket.on('teammate:code-update', handleCodeUpdate);

    return () => {
      socket.off('assignment:request_received', handleRequestReceived);
      socket.off('assignment:updated', handleAssignmentUpdated);
      socket.off('assignment:rejected', handleAssignmentRejected);
      socket.off('teammate:code-update', handleCodeUpdate);
    };
  }, [socket, teamData, currentUserId]);

  // Fetch all questions for "Testing Mode" support
  const [allQuestions, setAllQuestions] = useState([]);

  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        const response = await apiClient.get('/api/testing/questions');
        if (response.data?.data?.questions) {
          setAllQuestions(response.data.data.questions);
        }
      } catch (err) {
        console.error('Failed to fetch all questions:', err);
      }
    };
    fetchAllQuestions();
  }, []);

  // Use questions from API (room specific) OR fallback/append all questions
  // We prioritize room questions but ensure ALL questions are available as requested
  const finalQuestions = useMemo(() => {
    const roomQs = questionsData?.questions || [];
    const roomQIds = new Set(roomQs.map(q => q.id));

    // Filter out duplicates from allQuestions
    const additionalQs = allQuestions.filter(aq => !roomQIds.has(aq.id));

    const merged = [...roomQs, ...additionalQs];

    return merged.map(q => ({
      ...q,
      constraints: q.constraints || [],
      examples: (q.testCases && q.testCases.length > 0)
        ? q.testCases.map(tc => ({
          input: tc.input,
          output: tc.output,
          explanation: tc.explanation
        }))
        : ((q.sampleInput && q.sampleOutput) ? [{
          input: q.sampleInput,
          output: q.sampleOutput,
          explanation: null
        }] : []),
      hints: q.hints || []
    }));
  }, [questionsData, allQuestions]);

  // Set initial selected question when data loads
  useEffect(() => {
    if (finalQuestions?.length > 0 && !selectedQuestion) {
      console.log('🎯 Setting initial question:', finalQuestions[0].id, finalQuestions[0].title);
      setSelectedQuestion(finalQuestions[0].id);
    }
  }, [finalQuestions, selectedQuestion]);

  // Handle user code changes (updates state + cache)
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (selectedQuestion && language) {
      codeCache.current[`${selectedQuestion}_${language}`] = newCode;
    }
  };

  // Update code when language changes or question changes
  useEffect(() => {
    // Only Fetch/Update if dealing with my own editor
    if ((activeEditor !== 'me' && activeEditor !== currentUserId) || !selectedQuestion || !finalQuestions?.length) return;

    const q = finalQuestions.find(q => q.id === selectedQuestion);
    if (!q) {
      console.warn('Selected question not found in finalQuestions', selectedQuestion);
      return;
    }

    console.log('🔄 Switching to Question:', q.title, 'Language:', language);

    // 1. Check Cache first
    const cacheKey = `${selectedQuestion}_${language}`;
    if (cacheKey in codeCache.current) {
      console.log('📦 Using Cached Code');
      const cachedCode = codeCache.current[cacheKey];
      setCode(cachedCode);

      // Restore context if available
      if (q.templates && q.templates[language]) {
        const tmpl = q.templates[language];
        setHeaderCode(tmpl.headerCode || '');
        setBoilerplate(tmpl.boilerplate || '');
        setDefinition(tmpl.definition || '');
      }
      return;
    }

    // 2. Load from Template (if not in cache)
    // Check if q.templates is an object (map) or array (if legacy)
    let template = null;
    if (q.templates) {
      if (Array.isArray(q.templates)) {
        // Legacy array support
        template = q.templates.find(t => t.language === language);
      } else if (q.templates[language]) {
        // Map support
        template = q.templates[language];
      }
    }

    if (template) {
      console.log('📄 Using Template from Data');
      const newCode = (template.definition ? template.definition + '\n\n' : '') + (template.userFunction || '');
      setCode(newCode);
      setHeaderCode(template.headerCode || '');
      setBoilerplate(template.boilerplate || '');
      setDefinition(template.definition || '');

      // Seed the cache
      updateCache(selectedQuestion, language, newCode);
      return;
    }

    // 3. Fallback: Fetch starter code
    console.log('☁️ Fetching from API...');
    setCode('// Loading starter code...');

    const fetchStarterCode = async () => {
      try {
        const identifier = q.slug;
        if (!identifier) return;

        const response = await apiClient.get(`/api/problems/${identifier}?language=${language}`);
        if (response.data?.data?.codeTemplate) {
          const fetchedCode = response.data.data.codeTemplate;
          setCode(fetchedCode);
          updateCache(selectedQuestion, language, fetchedCode);
        } else {
          setCode('// Code template not found.');
        }
      } catch (error) {
        console.error('Failed to fetch starter code:', error);
        setCode('// Failed to load code.');
      }
    };

    fetchStarterCode();
  }, [language, selectedQuestion, finalQuestions, activeEditor, currentUserId]);

  // --- Assignment Handlers ---
  const handleRequestAssignment = (questionId) => {
    const q = finalQuestions?.find(q => q.id === questionId);
    const title = q?.title || 'Unknown Question';

    if (cooldowns[questionId]) return;

    // Check if user already has an assignment (one question per user)
    if (userAssignments[currentUserId]) {
      toast.error('You already have an active assignment. Complete it first!', { icon: '⚠️', duration: 3000 });
      return;
    }

    if (teamData?.isLeader) {
      // Leader auto-assigns self
      socket?.emit('assignment:approve', { teamId, questionId, requesterId: currentUserId });
    } else {
      socket?.emit('assignment:request', { teamId, questionId, questionTitle: title });
      // Open Team Management panel to see pending status
      setRightPanelExpanded('team');
      setRightPanelTab('team');
    }
  };

  const handleApproveAssignment = (questionId, requesterId, requestId = null) => {
    // This handles both:
    // 1. Leader approving a request from TeamManagement (has requestId)
    // 2. Leader directly assigning to self from ProblemPanel (no requestId, use direct assignment)

    if (!requesterId || requesterId === currentUserId) {
      // Direct assignment to self
      socket?.emit('assignment:direct', { teamId, questionId, userId: currentUserId });
    } else {
      // Approving someone else's request
      socket?.emit('assignment:approve', { teamId, questionId, requesterId, requestId });
    }
  };

  const handleRejectAssignment = (questionId, requesterId, requestId = null) => {
    socket?.emit('assignment:reject', { teamId, questionId, requesterId, requestId });
  };

  // Broadcast code changes to teammates
  useEffect(() => {
    if (!socket || !currentUserId) return;

    const myAssignment = userAssignments[currentUserId];
    if (!myAssignment) return; // Only broadcast if I have an assignment

    // Debounce code updates (broadcast every 500ms)
    const timeoutId = setTimeout(() => {
      socket.emit('code-update', {
        teamId,
        questionId: myAssignment,
        code,
        language
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [code, language, socket, currentUserId, userAssignments, teamId]);

  // Handle editor tab switching - show teammate's code when their tab is clicked
  useEffect(() => {
    if (activeEditor === currentUserId || activeEditor === 'me') {
      // Viewing my own code - no change needed
      return;
    }

    // Viewing a teammate's code
    const teammateCode = teamMembersCode[activeEditor];
    if (teammateCode) {
      setCode(teammateCode.code || '');
      setLanguage(teammateCode.language || 'python');
      if (teammateCode.questionId) {
        setSelectedQuestion(teammateCode.questionId);
      }
    }
  }, [activeEditor, teamMembersCode, currentUserId]);

  const handleRun = async (currentCode) => {
    if (!selectedQuestion) {
      toast.error('Please select a question first');
      return;
    }

    // Use the code passed from the editor, or fallback to state
    const codeToRun = currentCode || code;

    try {
      const result = await runCode(selectedQuestion, codeToRun, language, teamId);

      // Show success toast
      const passed = result.testsPassed || 0;
      const total = result.totalTests || 0;
      toast.success(`${passed}/${total} test cases passed`);

      // Result automatically updates via runResult state
    } catch (error) {
      const errorMsg = executionError || 'Failed to run code';
      toast.error(errorMsg);
      console.error('Run error:', error);
    }
  };

  const handleSubmit = async (currentCode) => {
    if (!selectedQuestion) {
      toast.error('Please select a question first');
      return;
    }

    if (!currentUserId || !userAssignments[currentUserId] || userAssignments[currentUserId] !== selectedQuestion) {
      // Just in case check to prevent 403
    }

    // Use the code passed from the editor, or fallback to state
    const codeToSubmit = currentCode || code;

    try {
      const result = await submitCode(selectedQuestion, codeToSubmit, language, teamId);

      if (result.verdict === 'ACCEPTED') {
        toast.success(`🎉 Accepted! +${result.points || 0} points`, { duration: 4000 });
      } else {
        const firstFailure = result.firstFailure;
        const failureMsg = firstFailure
          ? `${result.verdict}: Failed on test case ${firstFailure.index + 1}`
          : result.verdict;
        toast.error(failureMsg);
      }
    } catch (error) {
      const errorMsg = executionError || 'Failed to submit code';
      if (errorMsg.includes('Question not assigned')) {
        toast.error('Question not officially assigned. Please request assignment first.');
      } else {
        toast.error(errorMsg);
      }
      console.error('Submit error:', error);
    }
  };

  const handleResetCode = async () => {
    if (!selectedQuestion || !finalQuestions?.length) return;

    const q = finalQuestions.find(q => q.id === selectedQuestion);
    if (!q) return;

    try {
      const identifier = q.slug;
      if (!identifier) {
        console.warn('Question slug missing');
        return;
      }

      if (q.templates && q.templates[language]) {
        const tmpl = q.templates[language];
        setCode(tmpl.userFunction || '');
        setHeaderCode(tmpl.headerCode || '');
        setBoilerplate(tmpl.boilerplate || '');
        toast.success('Code reset to default');
        return;
      }

      const toastId = toast.loading('Reseting code...');
      const response = await apiClient.get(`/api/problems/${identifier}?language=${language}`);
      if (response.data?.data?.codeTemplate) {
        setCode(response.data.data.codeTemplate);
        // Removed setSampleCode which was undefined
        toast.success('Code reset to default', { id: toastId });
      } else {
        toast.error('Could not fetch starter code', { id: toastId });
      }
    } catch (error) {
      console.error('Failed to reset code:', error);
      toast.error('Failed to reset code');
    }
  };

  // Handle resize
  const handleMouseDown = (e) => {
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = (e.clientX / window.innerWidth) * 100;
      if (newWidth >= 30 && newWidth <= 60) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Room Timer logic
  const [timeLeft, setTimeLeft] = useState({ minutes: 0, seconds: 0 });
  const router = useRouter(); // Ensure useRouter is imported

  useEffect(() => {
    if (roomData?.createdAt) {
      const created = new Date(roomData.createdAt).getTime();
      // Duration from room settings or default 10m. 
      // roomData.duration is in minutes.
      const durationMins = roomData.duration || 10;
      const expires = created + durationMins * 60 * 1000;

      const interval = setInterval(() => {
        const now = Date.now();
        const diff = expires - now;

        if (diff <= 0) {
          setTimeLeft({ minutes: 0, seconds: 0 });
          clearInterval(interval);
        } else {
          const m = Math.floor(diff / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft({ minutes: m, seconds: s });
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [roomData]);

  const handleLeaveRoom = () => {
    // Just redirect to home or rooms list
    router.push('/room');
  };

  const handleStopRoom = async () => {
    if (!confirm("Are you sure you want to stop the room? This will delete the room for everyone.")) return;
    try {
      await apiClient.delete(`/api/rooms/${roomId}`);
      toast.success("Room stopped successfully");
      // Redirect handled by socket event or manual push
      router.push('/room');
    } catch (err) {
      console.error("Failed to stop room:", err);
      toast.error("Failed to stop room");
    }
  };

  // Loading State - Render Loading View ONLY if we have absolutely no questions yet
  // We relaxed this check to allow rendering even if room data fails, as long as we have 'allQuestions' or if we just want to show empty state.
  if (!questionsData && !allQuestions.length && roomId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading battle arena...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Top Header Bar */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={handleLeaveRoom} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-gray-900">{roomData?.name || 'Coding Room'}</h1>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {teamData?.name || 'My Team'}
              </span>
            </div>
          </div>
        </div>

      
      

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {roomData?.isAdmin && (
            <button
              onClick={handleStopRoom}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              Stop Room
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Editor Layout - Responsive Stacking */}
          <div className="flex-1 flex overflow-hidden relative">
            {/* Problem Panel */}
            <ProblemPanel
              activeTab={activeTab}
              onTabChange={setActiveTab}
              selectedQuestion={selectedQuestion}
              onQuestionSelect={setSelectedQuestion}
              questions={finalQuestions}
              style={{ width: `${leftPanelWidth}%` }}
              isLeader={teamData?.isLeader || false}
              questionAssignments={questionAssignments}
              pendingRequests={pendingRequests}
              currentUserId={currentUserId}
              cooldowns={cooldowns}
              onRequestQuestion={handleRequestAssignment}
              onAssignQuestion={handleApproveAssignment}
            />

            {/* Resize Handle */}
            <div
              onMouseDown={handleMouseDown}
              className="absolute top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 z-20 transition-colors"
              style={{ left: `${leftPanelWidth}%` }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-12 bg-white rounded-full shadow border border-gray-200 flex items-center justify-center">
                <div className="w-0.5 h-4 bg-gray-300 rounded-full mx-0.5"></div>
              </div>
            </div>

            {/* Code Editor Panel */}
            {(() => {
              const assignment = selectedQuestion ? questionAssignments[selectedQuestion] : null;
              const assignedUser = assignment?.userId;
              const assignedUserName = assignment?.username || 'a teammate';

              const isAssignedToMe = currentUserId && assignedUser === currentUserId;
              const isAssignedToSomeoneElse = assignedUser && !isAssignedToMe;
              const isViewingTeammate = activeEditor !== currentUserId && activeEditor !== 'me';

              // Lock Logic
              let isLocked = true; // Default to locked
              let lockMessage = '';

              if (isViewingTeammate) {
                // Case 1: Viewing teammate's code (Read Only)
                isLocked = true;
                lockMessage = `Viewing ${teamData?.members?.find(m => m.userId === activeEditor)?.username || 'teammate'}'s code (Read Only)`;
              } else if (isAssignedToSomeoneElse) {
                // Case 2: Assigned to someone else
                isLocked = true;
                lockMessage = `This question is assigned to ${assignedUserName}`;
              } else if (isAssignedToMe) {
                // Case 3: Assigned to me (Unlocked)
                isLocked = false;
              } else {
                // Case 4: Unassigned
                isLocked = true;
                lockMessage = 'Request assignment to start solving';
              }

              return (
                <CodeEditorPanel
                  code={code}

                  headerCode={headerCode}
                  boilerplate={boilerplate}
                  definition={definition}
                  setCode={handleCodeChange}
                  activeEditor={activeEditor}
                  onEditorChange={setActiveEditor}
                  language={language}
                  onLanguageChange={setLanguage}
                  onRun={handleRun}
                  onSubmit={handleSubmit}
                  onResetCode={handleResetCode}
                  isRunning={isRunning}
                  isSubmitting={isSubmitting}
                  output={runResult}
                  submissionResult={submitResult}
                  teamMembers={teamData?.members || []}
                  currentUserId={currentUserId}
                  leaderId={teamData?.leaderId}
                  timeLeft={timeLeft}
                  isLocked={isLocked}
                  lockMessage={lockMessage}
                  selectedQuestion={selectedQuestion}
                  style={{ width: `${100 - leftPanelWidth}%` }}
                />
              );
            })()}
          </div>
        </div>

        <RightSidebar
          isLeader={teamData?.isLeader || false}
          params={params}
          teamMembers={teamData?.members || []}
          leaderId={teamData?.leaderId}
          currentUserId={currentUserId}
          todaySolved={0}
          totalSolved={0}
          questionAssignments={questionAssignments}
          pendingRequests={pendingRequests}
          onAssignQuestion={handleApproveAssignment}
          onRejectQuestion={handleRejectAssignment}

          // Lifted State Props
          expandedPanel={rightPanelExpanded}
          setExpandedPanel={setRightPanelExpanded}
          activeTab={rightPanelTab}
          setActiveTab={setRightPanelTab}
        />
      </div>
    </div>
  );
}
