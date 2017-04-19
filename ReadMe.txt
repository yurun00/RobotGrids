Direction for use:

Open the index.html in chrome. You can see a grid board. You can press 'R', 'L' or space to move the robot. You can also choose one of the modes, which correspond to different tasks.

For the first mode, you can set the start position, face direction and a sequence of actions. When you press 'Go', the robot will move as the actions indicating.

For the second mode, you can set the start position, start face direction, target position, target face direction and maximum actions. When you press 'GO', a sequence of action sequences will be generated. You can choose one action sequence to move the robot to the target state. 
 
Implement Details:

For the convenience of calculation, the direction is associated with its own vectors :

----------> X
|                W
|              [0,-1]
|         _ _ _ _ _ _ _ _
|        |_|_|_|_|_|_|_|_|
|        |_|_|_|_|_|_|_|_|
|        |_|_|_|_|_|_|_|_|
|    S   |_|_|_|_|_|_|_|_|   N
| [-1,0] |_|_|_|_|_|_|_|_| [1,0]
|        |_|_|_|_|_|_|_|_|
|        |_|_|_|_|_|_|_|_|
/        |_|_|_|_|_|_|_|_|
Y                
                 E
			   [0,1]

When we move forward the robot, assuming the direction vector is [p, q], then the next position of the robot would be [x+p, y+q].

In order to map the direction vector back to the charactor of "WSEN", arr2ch is defined and the charactor is calculated in this way:

    var arr2ch = {0: 'W', 1: 'S', 4: 'E', 3: 'N'} where the key is calculated by (dir[0] + 2 * dir[1] + 2)
	
The robot object is defined with member functions such as update(), move(), toLeft() and toRight(), where the first one calls the others.

The update function change the state of the robot according the keyboard input code of 'R', 'L', and space. So if the program read in a sequence of charactors consist of 'R', 'L' and 'M', it need to convert the charactor to suitable code.

The logic of the first task is not hard to be understood, but the second task is more complicated. My solution based on dynamic programming takes time complexity of O(n + m), where n represents the maximum actions, and the m represents the amount of possible solutions.

First, a multi-dimensional array called 'dp' is defined. The boolean value dp[i][f][x][y] means whether we can reach the state of position[x, y] and face direction f from the initial state with exactly i actions. Here x, y represents the row and column number, different from that of the robot. And f represents the face direction with mapping {'W': 0, 'S': 1, 'E': 2, 'N': 3}.

Based on the definition above, the recursive equation for the dynamic programming solution is as follows:

    dp[i][f][x][y] = true, if dp[i-1][(f+3)%4][x][y] == true so the i th action is 'L'
                           or dp[i-1][(f+1)%4][x][y] == true so the i th action is 'R'
                           or dp[i-1][f][x'][y'] so that i th action is 'M'

x' and y' represent the position that can reach position[x, y] with 'M' action and is in the range of the grid board.

Second, we generate the sequence of action sequence with back tracking. 

Assume the target state is xt, yt, ft and the maximum action is N. We need to check all dp[j][ft][xt][yt] for 1 <= j <= N which correspond to all possible solutions with different number of actions. To generate the sequence, we keep searching for the previous possible actions according to the DP recursive rules until we reach the basis which mean j is equal to 0. So we follow a path in the recursive tree, and we always pick the node with value of true, and that guarentees we will reach the initial state finally and we do not traverse a path twice. So the time complexity is the number of possible solutions.






