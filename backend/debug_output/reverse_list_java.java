import java.io.*;
import java.util.*;

public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) {
            this.val = val;
            this.next = null;
        }
    }

    static class TreeNode {
        int val;
        TreeNode left, right;
        TreeNode(int val) {
            this.val = val;
            this.left = null;
            this.right = null;
        }
    }

    static TreeNode parseTree(String[] tokens) {
        if (tokens.length == 0 || tokens[0].equals("null")) return null;
        
        TreeNode root = new TreeNode(Integer.parseInt(tokens[0]));
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        int i = 1;
        
        while (!queue.isEmpty() && i < tokens.length) {
            TreeNode node = queue.poll();
            
            if (i < tokens.length && !tokens[i].equals("null")) {
                node.left = new TreeNode(Integer.parseInt(tokens[i]));
                queue.offer(node.left);
            }
            i++;
            
            if (i < tokens.length && !tokens[i].equals("null")) {
                node.right = new TreeNode(Integer.parseInt(tokens[i]));
                queue.offer(node.right);
            }
            i++;
        }
        
        return root;
    }

    static ListNode parseLinkedList(BufferedReader br) throws IOException {
        String line = br.readLine().trim();
        
        // Handle empty array []
        if (line.equals("[]")) return null;
        
        // Remove brackets and parse
        line = line.substring(1, line.length() - 1); // Remove [ and ]
        if (line.isEmpty()) return null;
        
        String[] vals = line.split(",");
        if (vals.length == 0) return null;
        
        ListNode head = new ListNode(Integer.parseInt(vals[0].trim()));
        ListNode curr = head;
        
        for (int i = 1; i < vals.length; i++) {
            curr.next = new ListNode(Integer.parseInt(vals[i].trim()));
            curr = curr.next;
        }
        
        return head;
    }

    static List<List<Integer>> parseGraph(BufferedReader br, boolean isDirected) throws IOException {
        int n = Integer.parseInt(br.readLine());
        int m = Integer.parseInt(br.readLine());
        
        if (n <= 0) return new ArrayList<>();
        
        List<List<Integer>> graph = new ArrayList<>();
        for (int i = 0; i < n; i++) graph.add(new ArrayList<>());
        
        for (int i = 0; i < m; i++) {
            String[] edge = br.readLine().split(" ");
            int u = Integer.parseInt(edge[0]);
            int v = Integer.parseInt(edge[1]);
            graph.get(u).add(v);
            if (!isDirected) graph.get(v).add(u);
        }
        
        return graph;
    }

    static String serializeArray(int[] arr) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(arr[i]);
        }
        sb.append("]");
        return sb.toString();
    }

    static String serializeList(List<Integer> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(list.get(i));
        }
        sb.append("]");
        return sb.toString();
    }

    static String serializeMatrix(int[][] matrix) {
        if (matrix.length == 0) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < matrix.length; i++) {
            if (i > 0) sb.append(",");
            sb.append(serializeArray(matrix[i]));
        }
        sb.append("]");
        return sb.toString();
    }

    static String serializeListMatrix(List<List<Integer>> matrix) {
        if (matrix.isEmpty()) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < matrix.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append(serializeList(matrix.get(i)));
        }
        sb.append("]");
        return sb.toString();
    }

    static String serializeTree(TreeNode root) {
        if (root == null) return "[]";
        
        List<String> result = new ArrayList<>();
        Queue<TreeNode> queue = new LinkedList<>();
        queue.offer(root);
        
        while (!queue.isEmpty()) {
            TreeNode node = queue.poll();
            
            if (node != null) {
                result.add(String.valueOf(node.val));
                queue.offer(node.left);
                queue.offer(node.right);
            } else {
                result.add("null");
            }
        }
        
        while (!result.isEmpty() && result.get(result.size() - 1).equals("null")) {
            result.remove(result.size() - 1);
        }
        
        return "[" + String.join(",", result) + "]";
    }

    static String serializeLinkedList(ListNode head) {
        List<Integer> result = new ArrayList<>();
        ListNode curr = head;
        
        while (curr != null) {
            result.add(curr.val);
            curr = curr.next;
        }
        
        return serializeList(result);
    }
    
    public static ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        
        while (curr != null) {
            ListNode nextNode = curr.next; // store next
            curr.next = prev;              // reverse link
            prev = curr;                   // move prev
            curr = nextNode;               // move curr
        }
        
        return prev; // new head
    }
    
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        // Parse inputs
        ListNode arg0 = parseLinkedList(br);
        
        // Call user function
        ListNode result = reverseList(arg0);
        
        // Serialize and print output
        System.out.println(serializeLinkedList(result));
    }
}