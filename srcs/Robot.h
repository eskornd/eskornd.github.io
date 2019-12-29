#ifndef SUDOKU_ROBOT_H_INCLUDED
#define SUDOKU_ROBOT_H_INCLUDED

#include "Game.h"
#include <functional>

class Robot
{
public:
    enum class Order
    {
        eNatural = 0, // natural order
        eMostConstraintsFirst = 1, // most constraints first
        eLeastConstraintsFirst = 2, // least constraints first
    };
    
    using Callback = std::function<void()>;
    
	template <size_t N>
    void solve(const Game<N> & game, Callback callback = nullptr);

    void setOrder(Order order) { _order = order;}
    
private:
    // strategies
    Order _order = Order::eNatural; // which order to use for the next index
    bool _useDynamicOrder = true; // recalculate order on each level
    
    template <size_t N>
    std::vector<size_t> unfilledIndexes(const Game<N> & game) const;
};

#endif // SUDOKU_ROBOT_H_INCLUDED
