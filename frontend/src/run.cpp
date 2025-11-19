#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    if (!(cin >> n)) {
        cerr << "Input Error: expected integer n\n";
        return 1;
    }

    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        if (!(cin >> arr[i])) {
            cerr << "Input Error: array must contain integers\n";
            return 1;
        }
    }

    int target;
    if (!(cin >> target)) {
        cerr << "Input Error: expected target integer\n";
        return 1;
    }

    // simple two sum logic
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            if (arr[i] + arr[j] == target) {
                cout << i << " " << j;
                return 0;
            }
        }
    }

    cout << "No pair found";
}
