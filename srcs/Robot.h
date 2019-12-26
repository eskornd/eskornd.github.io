#ifndef SUDOKU_ROBOT_H_INCLUDED
#define SUDOKU_ROBOT_H_INCLUDED

#include "Game.h"
#include <functional>

class Robot
{
public:
    using Callback = std::function<void()>;
    
	template <size_t N>
    void solve(const Game<N> & game, Callback callback = nullptr);
    
};

#endif // SUDOKU_ROBOT_H_INCLUDED
