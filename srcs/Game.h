#ifndef SUDOKU_GAME_H_INCLUDED
#define SUDOKU_GAME_H_INCLUDED

#include <cstdint>
#include <vector>
#include <array>
#include <iostream>
#include <optional>
#include <set>

template<class T> using opt = std::optional<T>;
using Num = uint8_t;

template <size_t N>
class Game
{
public:
    Game();
	Game(const std::vector<opt<Num>> & inNums);
    
    Game(const Game<N> & inRhs);
    Game& operator=(const Game<N> & inRhs);
	
	size_t size() const;

    const opt<Num> & at(size_t index) const;
    bool has(size_t index) const;
    
    
	const opt<Num> & at(size_t row, size_t col) const;
    bool has(size_t row, size_t col) const;
    
    bool isLegal() const;
    
    bool passed() const;

    void assign(size_t index, const opt<Num> & num);
    void assign(size_t row, size_t col, const opt<Num> & num);
    
    void unassign(size_t index);
    
    std::vector<size_t> unfilledIndexes(bool most_constraints_first = false) const;
    
	template <size_t M>
	friend std::ostream & operator<< (std::ostream & os, const Game<M> & game);
    
    class Notation
    {
    public:
        Notation()
        : _nums(defaultNums())
        {
            
        }
        
        void reset()
        {
            _nums = defaultNums();
        }
        
        const std::set<Num> & nums() const { return _nums; }
        
        void insert(Num num)
        {
            _nums.insert(num);
        }
        
        void erase(Num num)
        {
            _nums.erase(num);
        }
        
        size_t size() const
        {
            return _nums.size();
        }
        
        void clear()
        {
            _nums.clear();
        }
        
        bool contains(Num num) const
        {
            return _nums.end()!=_nums.find(num);
        }
        
        opt<Num> nextNum(const opt<Num> &currentNum) const
        {
            opt<Num> next;
            for (auto it = _nums.begin(); it!=_nums.end(); ++it)
            {
                if (!currentNum)
                {
                    next = *it;
                    break;
                }
                if (currentNum.value()<*it)
                {
                    next = *it;
                    break;
                }
            }
            return next;
        }
        
    private:
        
        std::set<Num> _nums;
        static const std::set<Num>& defaultNums()
        {
            static std::set<Num> default_nums;
            static bool initialized = false;
            if (!initialized)
            {
                for ( size_t i=0; i<N; ++i)
                {
                    default_nums.insert( 1+i );
                }
                initialized = true;
            }
            return default_nums;
        }
    };
    
    const std::vector<Notation> & notations() const;
    
    
    using NumArray1D = std::array<opt<Num>, N>;
    using NumArray2D = std::array<NumArray1D, N>;
    
private:
    static constexpr size_t NN=N*N;
	std::array<opt<Num>, NN> _nums;
    NumArray2D _rows;
    NumArray2D _cols;
    NumArray2D _grids;
    std::array<NumArray2D*, 3> _groups;
    
    std::array<std::pair<size_t, size_t>, NN> _lutIndexToGrid;
    std::array<std::array<size_t, N>,N> _lutGridToIndex;
    
    void initIndexLUT();
    
    std::vector<Notation> _notations;
    void initNotations();
    // denote num from all notations for row/col/grid at index
    void denoteFromRowColGrid(size_t index, Num num);
    // note num from all notations for row/col/grid at index
    void noteFromRowColGrid(size_t index, Num num);
    // note unique num at index
    void noteUnique(size_t index, Num num);
    
    
    void checkSinglePosition();
};

#endif // SUDOKU_GAME_H_INCLUDED
