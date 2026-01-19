'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
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
        toast.success(`You have been assigned!`, { icon: '🚀', duration: 3000 });
        // Switch to the assigned question
        setSelectedQuestion(data.questionId);
      } else {
        toast.success(`${name} was assigned to a question`, { icon: '✅', duration: 2000 });
      }
    };

    const handleAssignmentRejected = (data) => {
      setPendingRequests(prev => prev.filter(req => !(req.questionId === data.questionId && req.requesterId === data.requesterId)));

      if (data.requesterId === currentUserId) {
        toast.error('Request rejected. Cooldown started.', { icon: '❌', duration: 3000 });
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

  // Use ONLY real questions from API (no mock fallback)
  const finalQuestions = questionsData?.questions?.length > 0
    ? questionsData.questions.map(q => ({
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
    }))
    : []; // Return empty array if no questions loaded

  // Set initial selected question when data loads
  useEffect(() => {
    if (finalQuestions?.length > 0 && !selectedQuestion) {
      console.log('🎯 Setting initial question:', finalQuestions[0].id, finalQuestions[0].title);
      setSelectedQuestion(finalQuestions[0].id);
    }
  }, [finalQuestions, selectedQuestion]);

  // Update code when language changes or question changes
  useEffect(() => {
    // Only fetch starter code if looking at my own editor
    if ((activeEditor !== 'me' && activeEditor !== currentUserId) || !selectedQuestion || !finalQuestions?.length) return;

    const q = finalQuestions.find(q => q.id === selectedQuestion);
    if (!q) return;

    // Use local templates if available
    if (q.templates && q.templates[language]) {
      const tmpl = q.templates[language];
      setCode(tmpl.userFunction || '');
      setHeaderCode(tmpl.headerCode || '');
      setBoilerplate(tmpl.boilerplate || '');
      setDefinition(tmpl.definition || '');
      return;
    }

    // Fallback: Fetch starter code from backend (should rarely be needed now)
    const fetchStarterCode = async () => {
      try {
        const identifier = q.slug;
        if (!identifier) {
          console.warn('Question slug missing');
          return;
        }

        const response = await apiClient.get(`/api/problems/${identifier}?language=${language}`);
        if (response.data?.data?.codeTemplate) {
          // Backward compatibility if API returns old format
          setCode(response.data.data.codeTemplate);

        }

      } catch (error) {
        console.error('Failed to fetch starter code:', error);
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
        setSampleCode(response.data.data.codeTemplate);
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

  // Loading State - Render Loading View if needed
  if (!questionsData && roomId) {
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
    <div className="h-screen flex overflow-hidden bg-gray-50">
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
                setCode={setCode}
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
  );
}
