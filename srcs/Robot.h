#ifndef SUDOKU_ROBOT_H_INCLUDED
#define SUDOKU_ROBOT_H_INCLUDED

#include "Game.h"
#include <functional>
#include <stack>

template <size_t N>
struct Solution
{
    opt<Game<N>> endGame;
    size_t deadEnd = 0;
    size_t numGuess = 0;
};

class Robot
{
public:
    enum class IndexOrder
    {
        eNatural = 0, // natural order
        eMostConstraintsFirst = 1, // most constraints first
        eLeastConstraintsFirst = 2, // least constraints first
    };
    
    enum class NumOrder
    {
        eAscending = 0, // from 1 to N
        eDescending = 1, // from N to 1
    };
    
    using Callback = std::function<void()>;
    
    // return the solution if solved, otherwise empty
	template <size_t N>
    Solution<N> solve(const Game<N> & game, Callback callback = nullptr);

    void setIndexOrder(IndexOrder order);
    void setNumOrder(NumOrder order);
    
private:
    // strategies
    IndexOrder _indexOrder = IndexOrder::eNatural; // which order to use for the next index
    NumOrder _numOrder = NumOrder::eAscending; // which order to use for the next index
    bool _onlyUseValidValue = true; // recalculate order on each level
    bool _useDynamicOrder = true; // recalculate order on each level
    
    template <size_t N>
    std::vector<size_t> unfilledIndices(const Game<N> & game) const;
    
    //
    template <size_t N>
    struct Memo
    {
        size_t index; // which index filled?
        Num value; // filled value
        bool isSingleChoice; //is the only choice
        std::vector<typename Game<N>::Notation> notations;
    };
    
    template <size_t N>
    struct Brain
    {
        Game<N> game;
        std::stack<Memo<N>> memos; // stack of the last action
        opt<Memo<N>> rewinded; // last step is rewinded?
        std::stack<size_t, std::vector<size_t>> unfilledIndices; // to be filled indexes
        size_t rewind_count = 0;
        size_t dead_end = 0;
        size_t num_guess = 0;
    };
    
    
    template <size_t N>
    void rewind(Brain<N> & brain);
    
    template <size_t N>
    void forward(Brain<N> & brain, const Memo<N> & m);
    
    template <size_t N>
    opt<Robot::Memo<N>> findNextStep(Brain<N> & brain);
    
    template <size_t N>
    size_t nextIndex(Brain<N> & brain);
    
    template <size_t N>
    opt<Num> nextNum(const Brain<N> & brain, size_t index, opt<Num> currentValue, bool * outIsSingleChoice);
    
    size_t _loopCount=0;
};

#endif // SUDOKU_ROBOT_H_INCLUDED
