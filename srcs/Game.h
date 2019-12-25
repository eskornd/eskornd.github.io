#ifndef SUDOKU_GAME_H_INCLUDED
#define SUDOKU_GAME_H_INCLUDED

#include <cstdint>
#include <vector>
#include <array>
#include <iostream>
#include <optional>

//using Num = std::optional<uint8_t>;
using Num = std::optional<char>;

template <size_t N>
class Game
{
public:
	Game(const std::vector<Num> & inNums);
    
    Game(const Game<N> & inRhs);
    Game& operator=(const Game<N> & inRhs);
	
	size_t size() const;

    const Num& at(size_t index) const;
    bool has(size_t index) const;
    
    
	const Num& at(size_t row, size_t col) const;
    bool has(size_t row, size_t col) const;
    
    bool isLegal() const;
    
    bool isLegalInsert(size_t index, const Num & num);
    
    bool passed() const;

    void assign(size_t index, const Num & num);
    void assign(size_t row, size_t col, const Num & num);
    
    void unassign(size_t index);
    
    std::vector<size_t> unfilled() const;
    
	template <size_t M>
	friend std::ostream & operator<< (std::ostream & os, const Game<M> & game);
    
private:
    
    
	std::vector<Num> _nums;
    std::array<std::array<std::array<Num, N>, N>*, 3> _groups;
    std::array<std::array<Num, N>, N> _rows;// = _groups[0];
    std::array<std::array<Num, N>, N> _cols;// = _groups[1];
    std::array<std::array<Num, N>, N> _grids;// = _groups[2];
  	size_t _n;  
};

#endif // SUDOKU_GAME_H_INCLUDED
