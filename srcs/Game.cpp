#include "Game.h"
#include <cassert>
#include <set>
#include <utility>

bool sCheckPairs = false;
namespace
{
    size_t gridWidth(size_t N)
    {
        switch (N)
        {
            case 4:
                return 2;
                break;
            case 6:
                return 3;
                break;
            case 9:
                return 3;
                break;
            default:
                assert(false && "can't happen");
                break;
        }
        assert(false && "can't happen");
        return 0;
    }
    
    size_t gridHeight(size_t N)
    {
        switch (N)
        {
            case 4:
                return 2;
                break;
            case 6:
                return 2;
                break;
            case 9:
                return 3;
                break;
            default:
                assert(false && "can't happen");
                break;
        }
        assert(false && "can't happen");
        return 0;
    }
    
    template <size_t N>
    bool is_filled(const std::array<opt<Num>, N> & nums)
    {
        return std::all_of(nums.begin(), nums.end(), [](auto & num){
            return !!num;
        });
        
    }
    
    template <size_t N>
    bool has_no_duplicates(const std::array<opt<Num>, N> & nums, std::pair<size_t, size_t> * outIndexPair)
    {
        bool has_duplicate = false;
        for ( size_t i=0; i<nums.size(); ++i)
        {
            if ( std::nullopt==nums[i] )
                continue;
            
            for (size_t j=i+1; j<nums.size(); ++j)
            {
                if ( std::nullopt==nums[j] )
                    continue;
                
                if ( nums[i] == nums[j] )
                {
                    has_duplicate = true;
                    if (outIndexPair)
                    {
                        outIndexPair->first = i;
                        outIndexPair->second = j;
                    }
                    break;
                }
            }
            if (has_duplicate)
                break;
        }
        return !has_duplicate;
    }
    
    template <size_t N>
    std::pair<size_t, size_t> ToRowCol(size_t index)
    {
        auto row = index / N;
        auto col = index % N;
        return std::make_pair(row, col);
    }
    
    template <size_t N>
    size_t ToIndex(size_t row, size_t col)
    {
        return row * N + col;
    }
    
    template <size_t N>
    std::pair<size_t, size_t> ToGridRowCol(size_t row, size_t col)
    {
        auto w=gridWidth(N);
        auto h=gridHeight(N);
        
        auto grid_row = row/h;
        auto grid_col = col/w;
        size_t grid_index = grid_row * h + grid_col;
        auto cell_row = row % h;
        auto cell_col = col % w;
        size_t cell_index = cell_row * w + cell_col;
        return std::make_pair(grid_index, cell_index);
    }
    
    template <size_t N>
    std::pair<size_t, size_t> GridToRowCol(size_t grid_row, size_t grid_col)
    {
        auto w=gridWidth(N);
        auto h=gridHeight(N);
        
        auto col = (grid_row % h) * w + grid_col % w;
        auto row = (grid_row / h) * h + grid_col / w;
        return std::make_pair(row, col);
    }
    
    template <size_t N>
    std::pair<size_t, size_t> ToGridRowCol(size_t index)
    {
        auto pair = ToRowCol<N>(index);
        return ToGridRowCol<N>(pair.first, pair.second);
    }

}

template <size_t N>
Game<N>::Game()
: _groups({&_rows, &_cols, &_grids})
{
}

template <size_t N>
Game<N>::Game(const std::vector<opt<Num>> & inNums)
: _nums()
, _notations(inNums.size())
, _groups({&_rows, &_cols, &_grids})
, _initializing(true)
{
    //std::copy_n(inNums.begin(), N, _nums.begin());
    initIndexLUT();
	assert(inNums.size()==NN);
    assert(std::all_of(_nums.begin(), _nums.end(), [](auto & optNum){ return !optNum; }));
    for ( size_t i=0; i<inNums.size(); ++i)
    {
        if (!inNums[i])
            continue;
        
        assign(i, inNums[i]);
    }
    
    _initializing = false;
    initNotations();
}

template <size_t N>
Game<N>::Game(const Game<N> & inRhs)
: _nums(inRhs._nums)
, _rows(inRhs._rows)
, _cols(inRhs._cols)
, _grids(inRhs._grids)
, _notations(inRhs._notations)
, _lutIndexToGrid(inRhs._lutIndexToGrid)
, _lutGridToIndex(inRhs._lutGridToIndex)
{
    // deep copy
    _groups[0] = &_rows;
    _groups[1] = &_cols;
    _groups[2] = &_grids;
}

template <size_t N>
Game<N>& Game<N>::operator=(const Game<N> & inRhs)
{
    // deep copy
    _nums = inRhs._nums;
    _rows = inRhs._rows;
    _cols = inRhs._cols;
    _grids = inRhs._grids;
    _groups[0] = &_rows;
    _groups[1] = &_cols;
    _groups[2] = &_grids;
    
    _notations = inRhs._notations;
    _lutIndexToGrid = inRhs._lutIndexToGrid;
    _lutGridToIndex = inRhs._lutGridToIndex;
    return *this;
}

template <size_t N>
void Game<N>::initIndexLUT()
{
    for ( size_t i=0; i<NN; ++i)
    {
        auto pair = ToGridRowCol<N>(i);
        _lutGridToIndex[pair.first][pair.second] = i;
        _lutIndexToGrid[i] = pair;
    }
}

template <size_t N>
void Game<N>::unassign(size_t index)
{
    assign(index, std::nullopt);
}

template <size_t N>
void Game<N>::assign(size_t index, const opt<Num> & num)
{
    auto pair = ToRowCol<N>(index);
    assign(pair.first, pair.second, num);
}

template <size_t N>
void Game<N>::assign(size_t row, size_t col, const opt<Num> & optNum)
{
    if (optNum && optNum.value()>N)
    {
        assert( false && "Cannot happen");
    }
    
    auto index = ToIndex<N>(row, col);
    if ( optNum)
    {
        assert ( !_nums[index]);
    } else {
        assert ( _nums[index]);
    }
    Num theNum = optNum ? *optNum : *_nums[index];
    
    _nums[ToIndex<N>(row, col)] = optNum;
    _rows[row][col] = optNum;
    _cols[col][row] = optNum;
    auto grid_index_pair = ToGridRowCol<N>(row, col);

    //std::cout << "[" << row << "][" << col <<"] -> " << grid_index << ", " << cell_index <<std::endl;
    _grids[grid_index_pair.first][grid_index_pair.second] = optNum;
    
    
    initNotations();
}

template <size_t N>
size_t Game<N>::size() const
{
	return N;
}

template <size_t N>
size_t Game<N>::gridRowSize() const
{
	return gridWidth(N);
}

template <size_t N>
size_t Game<N>::gridColSize() const
{
	return gridHeight(N);
}

template <size_t N>
size_t Game<N>::cellRowSize() const
{
	return gridColSize();
}

template <size_t N>
size_t Game<N>::cellColSize() const
{
	return gridRowSize();
}

template <size_t N>
const opt<Num>& Game<N>::at(size_t index) const
{
    return _nums[index];
}

template <size_t N>
bool Game<N>::has(size_t index) const
{
    return !!_nums[index];
}

template <size_t N>
const opt<Num> & Game<N>::at(size_t row, size_t col) const
{
    return at(row*N+col);
}

template <size_t N>
bool Game<N>::has(size_t row, size_t col) const
{
    return has(ToIndex<N>(row, col));
}

template <size_t N>
bool Game<N>::isLegal() const
{
    int level_one_count = -1;
    int level_two_count = -1;
    std::pair<size_t, size_t> pair;
    bool is_legal = std::all_of(_groups.begin(), _groups.end(), [&level_one_count, &level_two_count, &pair](auto & group){
        ++level_one_count;
        level_two_count = -1;
        return std::all_of(group->begin(), group->end(), [&level_two_count, &pair](auto & v){
            ++level_two_count;
            return has_no_duplicates(v, &pair);
        });
    });
    return is_legal;
}

template <size_t N>
bool Game<N>::passed() const
{
    bool all_filled = std::all_of(_groups.begin(), _groups.end(), [](auto & group)
    {
        return std::all_of(group->begin(), group->end(), [](auto & v){
            return is_filled(v);
        });
    });
    return isLegal() && all_filled;
}

template <size_t N>
std::vector<size_t> Game<N>::unfilledIndexes(bool most_constraints_first) const
{
    std::vector<size_t> indexes;
    for (size_t i=0; i<_nums.size();++i)
    {
        if (!_nums[i])
        {
            indexes.push_back(i);
        }
    }
    
    if (most_constraints_first)
    {
        auto & notations = _notations;
        std::sort(indexes.begin(), indexes.end(), [&notations](auto & a, auto & b){
            
            return notations[a].size() == notations[b].size() ? a<b : notations[a].size() < notations[b].size();
        });
    }
    return indexes;
}

template <size_t M>
std::ostream & dump_simple(std::ostream & os , const Game<M> & game)
{
    size_t assigned = 0;
    for (size_t i =0; i<(M*M); ++i)
    {
        if (game.has(i))
            ++assigned;
    }
    os << "Dumping " << M << "x" << M<< " game, assigned: " << assigned << std::endl;

	for (size_t i=0; i<game.size(); ++i)
	{
		for (size_t j=0; j<game.size(); ++j)
		{
            if (game.has(i, j))
            {
                os << (int)game.at(i, j).value();
            } else {
                os << " ";
            }
            os << ", ";
		}
		os << std::endl;
	}
    
    os << "Check game: " << (game.passed() ? "OK" : "Bad") << std::endl;

	return os;
}

template <size_t M>
const char * dump_complex(const Game<M> & game)
{
	static const size_t cell_buf_len = 11;
    static char cell_buf[cell_buf_len+5];// = "{123456789}";
	static const char cell_split[] = ", ";
    static constexpr size_t cell_split_len = sizeof(cell_split) - 1;
	static const char linebreak[] = "\n";
	static constexpr size_t linebreak_len = sizeof(linebreak) - 1;
    static const char col_begin[] = "[";
    static constexpr size_t col_begin_len = sizeof(col_begin) - 1;
    static const char col_end[] = "]  ";
    static constexpr size_t col_end_len = sizeof(col_end) - 1;

	static constexpr size_t game_buf_len =
    ((cell_buf_len + cell_split_len) * M + linebreak_len)  * M +
    3* (3 * (col_begin_len + col_end_len)) +
    (3 * linebreak_len *2) +
    (M * linebreak_len);

	static char game_buf[game_buf_len];
	char * p = game_buf;

	for ( size_t row=0; row<M; ++row)
	{
		for ( size_t col=0; col<M; ++col)
		{
            bool is_col_begin = 1==(1+col)%game.cellColSize();
            bool is_col_end = 0==(1+col)%game.cellColSize();
            if (is_col_begin)
            {
                memcpy(p, col_begin, col_begin_len);
                p += col_begin_len;
            }
            
			size_t index = row * M + col;
			auto & optNum = game._nums[index];
			if (optNum)
			{
				sprintf(cell_buf , "     %d     ", optNum.value());
			} else {
                static const bool print_notations = true;
                if (!print_notations)
                {
                    sprintf(cell_buf, "           ");
                } else {
                    auto & nums = game._notations[index].nums();
                    sprintf(cell_buf, "{         }");
                    size_t pos = 0;
                    std::for_each(nums.begin(), nums.end(), [](auto & num){
                        cell_buf[num]=(0x30+num);
                    });
                    int bp=1;
                }
			}

			memcpy(p, cell_buf, cell_buf_len);
			p+=cell_buf_len;
            
            if (!is_col_end)
            {
                memcpy(p, cell_split, cell_split_len);
                p+=cell_split_len;
            } else {
                memcpy(p, col_end, col_end_len);
                p += col_end_len;
            }
		}
		memcpy(p, linebreak, linebreak_len);
		p+=linebreak_len;
        
        
        bool is_row_splitter = 0==(1+row)%game.cellRowSize();
        if (is_row_splitter)
        {
            memcpy(p, linebreak, linebreak_len);
            p+=linebreak_len;
//            memcpy(p, linebreak, linebreak_len);
//            p+=linebreak_len;
        } else {
//            memcpy(p, linebreak, linebreak_len);
//            p+=linebreak_len;
            
        }
	}
	return game_buf;

}

template <size_t M>
std::ostream & operator<<(std::ostream & os , const Game<M> & game)
{
	os << dump_complex(game);
	return os;
	return dump_simple(os, game);
}

template <size_t N>
void Game<N>::initNotations()
{
    if (_initializing)
        return;
    
    for ( size_t i = 0; i<_notations.size(); ++i)
    {
        if (_nums[i])
        {
            _notations[i].clear();
        } else {
            _notations[i].reset();
        }
    }
    
    for (size_t row = 0; row<_rows.size(); ++row)
    {
        for (size_t col =0; col < _cols.size(); ++col)
        {
            auto optNum = at(row, col);
            if (!optNum)
                continue;
            
            auto index = ToIndex<N>(row, col);
            auto & num = *optNum;
            denoteFromRowColGrid(index, num);
        }
    }
    
    for ( auto i = 0; i<_notations.size(); ++i)
    {
        size_t size =_notations[i].size();
        if ( 0 == size)
        {
            int bp = 0;
        } else  if (1==size)
        {
            int bp = 1;
        } else  if (2==size)
        {
            int bp = 2;
        }
    }
    
    // now check for notations;
    int bp = 0;
    bool changed = false;
    do
    {
        changed = false;
        checkSinglePosition(&changed);
    } while(changed);
    
    auto indexes = unfilledIndexes(true /*most constraints first*/);
    if (!indexes.empty() )
    {
        auto index = indexes.front();
        if (_notations[index].nums().size()>1)
        {
            // run out of single candidate;
            int bp = 1;
            checkPairs();
            checkTriplets();
            checkXWings();
            checkSingleLine();
            checkSingleLine();
        }
    }

}

template <size_t N>
void Game<N>::denoteFromRowColGrid(size_t index, Num num)
{
    auto index_pair = ToRowCol<N>(index);
    auto & row = index_pair.first;
    auto & col = index_pair.second;

    auto & notations = _notations;
    
    // denote num from row
    for (size_t i=0; i<_cols.size(); ++i)
    {
        denote(ToIndex<N>(row, i), num);
    }
    
    // denote num from col
    for (size_t i=0; i<_rows.size(); ++i)
    {
        denote(ToIndex<N>(i, col), num);
    }
    
    // denote num from grid
    auto & grid_index_pair = _lutIndexToGrid[index];
    for (size_t i=0; i<N; ++i)
    {
        denote(_lutGridToIndex[grid_index_pair.first][i], num);
    }
}

template <size_t N>
void Game<N>::noteFromRowColGrid(size_t index, Num num)
{
    auto index_pair = ToRowCol<N>(index);
    auto & row = index_pair.first;
    auto & col = index_pair.second;
    
    auto & notations = _notations;
    auto insert_num_at = [this, num](size_t index){
        //if (!has(index))
            _notations[index].insert(num);
    };
    
    // denote num from row
    for (size_t i=0; i<_cols.size(); ++i)
    {
        insert_num_at(ToIndex<N>(row, i));
    }
    
    // denote num from col
    for (size_t i=0; i<_rows.size(); ++i)
    {
        insert_num_at(ToIndex<N>(i, col));
    }
    
    // denote num from grid
    auto & grid_index_pair = _lutIndexToGrid[index];
    for (size_t i=0; i<N; ++i)
    {
        insert_num_at(_lutGridToIndex[grid_index_pair.first][i]);
    }
}

template <size_t N>
void Game<N>::checkSinglePosition(bool * outChanged)
{
    auto & nums = _nums;
    auto & notations = _notations;
    auto & lutGridToIndex = _lutGridToIndex;

    IndexFunc toIndexGrid = [&lutGridToIndex](size_t i, size_t j) -> size_t { return lutGridToIndex[i][j];};
    IndexFunc toIndexRow = [](size_t i, size_t j) -> size_t { return ToIndex<N>(i, j);};
    IndexFunc toIndexCol = [](size_t i, size_t j) -> size_t { return ToIndex<N>(j, i);};
    
    auto noteUniqueFunc = std::bind(&Game<N>::noteUnique, this, std::placeholders::_1, std::placeholders::_2);
    auto for_each_cells = [noteUniqueFunc, &nums, &notations](Num n, IndexFunc toIndex, bool * outChanged)
    {
        assert(outChanged);
        for (size_t i =0; i<N; ++i)
        {
            std::vector<size_t> index_containsN;
            for (size_t j = 0; j<N; ++j)
            {
                size_t index = toIndex(i,j);
                if (!nums[index] && notations[index].contains(n))
                    index_containsN.push_back(index);
            }
            
            if (1 ==index_containsN.size())
            {
                size_t theIndex = index_containsN.front();
                if (notations[theIndex].size()>1)
                {
                    *outChanged = true;
                    noteUniqueFunc(theIndex, n);
                }
            }
        }
    };
    
    // for a grid check if n
    for (size_t n=1; n<=N; ++n)
    {
        bool changed = false;
        for_each_cells( n, toIndexGrid, &changed);
        for_each_cells( n, toIndexRow, &changed);
        for_each_cells( n, toIndexCol, &changed);
        
        if (outChanged && changed)
        {
            *outChanged = true;
        }
    }
    
}

template <size_t N>
void Game<N>::denote(size_t index, Num num)
{
    size_t size_before = _notations[index].size();
    //if (!has(index))
    _notations[index].erase(num);
    size_t size_after = _notations[index].size();
    if (size_after==1 && size_before>1)
    {
        becomeUnique(index, *_notations[index].nums().begin());
    }
}

template <size_t N>
void Game<N>::noteUnique(size_t index, Num num)
{
    assert(_notations[index].size()>=1);
    if (_notations[index].size()>1)
    {
        _notations[index].clear();
        _notations[index].insert(num);
        becomeUnique(index, num);
    }
}

template <size_t N>
const std::vector<typename Game<N>::Notation> & Game<N>::notations() const
{
    return _notations;
}

template <size_t N>
std::vector<typename Game<N>::Notation> & Game<N>::notations()
{
    return _notations;
}

template <size_t N>
void Game<N>::becomeUnique(size_t index, Num num)
{
    int bp = 1;
}

template <size_t N>
void Game<N>::checkPairs()
{
    // TODO: we can do this for row col as well
    // for all grids
    for ( size_t i=0; i<N; ++i)
    {
        // for each unfilled cells pairs
        for (size_t j=0; j<N; ++j)
        {
            auto index_j = _lutGridToIndex[i][j];
            if (_nums[index_j])
                continue;
            
            for (size_t k=j+1; k<N; ++k)
            {
                auto index_k = _lutGridToIndex[i][k];
                if (_nums[index_k])
                    continue;
                
                std::set<Num> candidates;
                auto & nums_j = _notations[index_j].nums();
                candidates.insert(nums_j.begin(), nums_j.end());
                auto & nums_k = _notations[index_k].nums();
                candidates.insert(nums_k.begin(), nums_k.end());
                size_t num_candidates = candidates.size();
                if ( num_candidates == 2)
                {
                    int we_found_pair = 1;
                    // denote from grids who
                    for (auto it= candidates.begin(); it!=candidates.end(); ++it)
                    {
                        for (size_t u=0; u<N;++u)
                        {
                            if (u==j || u==k)
                                continue;
                            
                            auto denote_index = _lutGridToIndex[i][u];
                            if (!_nums[denote_index] && _notations[denote_index].contains(*it))
                            {
                                denote(denote_index, *it);
                            }
                        }
                    }
                    
                }
            }
        }
        
    }
}

template <size_t N>
void Game<N>::checkTriplets()
{
    // for all grids
    for ( size_t i=0; i<N; ++i)
    {
        // for each unfilled cells pairs
        for (size_t j=0; j<N; ++j)
        {
            auto index_j = _lutGridToIndex[i][j];
            if (_nums[index_j])
                continue;
            
            for (size_t k=j+1; k<N; ++k)
            {
                auto index_k = _lutGridToIndex[i][k];
                if (_nums[index_k])
                    continue;
                
                for (size_t l=k+1; l<N; ++l)
                {
                    auto index_l = _lutGridToIndex[i][l];
                    if (_nums[index_l])
                        continue;
                    
                    std::set<Num> candidates;
                    auto & nums_j = _notations[index_j].nums();
                    candidates.insert(nums_j.begin(), nums_j.end());
                    auto & nums_k = _notations[index_k].nums();
                    candidates.insert(nums_k.begin(), nums_k.end());
                    auto & nums_l = _notations[index_l].nums();
                    candidates.insert(nums_l.begin(), nums_l.end());
                    size_t num_candidates = candidates.size();
                    if ( num_candidates == 3)
                    {
                        int we_found_triple = 1;
                        // denote from grids who
                        for (auto it= candidates.begin(); it!=candidates.end(); ++it)
                        {
                            for (size_t u=0; u<N;++u)
                            {
                                if (u==j || u==k || u==l)
                                    continue;
                                
                                auto denote_index = _lutGridToIndex[i][u];
                                Num denote_num = *it;
                                if (!_nums[denote_index] && _notations[denote_index].contains(denote_num))
                                {
                                    denote(denote_index, denote_num);
                                }
                            }
                        }
                    }
                }
            }
        }
        
    }
}

template <size_t N>
void Game<N>::checkXWings()
{
    IndexFunc toIndexRow = [](size_t i, size_t j) -> size_t { return ToIndex<N>(i, j);};
    IndexFunc toIndexCol = [](size_t i, size_t j) -> size_t { return ToIndex<N>(j, i);};
    
    auto check_xwings = [this](Num n, IndexFunc indexFunc)
    {
        // 1st scan, first: outer index, inner: inner indexes which notates n
        std::vector<std::pair<size_t, std::vector<size_t>>> v;
        for (size_t i=0;i<N;++i)
        {
            std::vector<size_t> indexes;
            for (size_t j=0;j<N;++j)
            {
                size_t index = indexFunc(i,j);
                if ( _nums[index])
                    continue;
                
                if ( _notations[index].contains(n))
                {
                    indexes.push_back(j);
                }
            }

            if (indexes.size()==2)
            {
                v.emplace_back(std::make_pair(i, std::move(indexes)));
            }
        }
        
        // check if two outer indexes has the exact same inner index
        for ( size_t a=0; a<v.size(); ++a)
        {
            for (size_t b=a+1; b<v.size(); ++b)
            {
                if (v[a].second == v[b].second)
                {
                    bool found_xwing = true;
                    auto row_col_0 = ToRowCol<N>(indexFunc(v[a].first, v[a].second[0]));
                    auto row_col_1 = ToRowCol<N>(indexFunc(v[a].first, v[a].second[1]));
                    auto row_col_2 = ToRowCol<N>(indexFunc(v[b].first, v[b].second[0]));
                    auto row_col_3 = ToRowCol<N>(indexFunc(v[b].first, v[b].second[1]));
                    assert(row_col_0.first == row_col_1.first);
                    assert(row_col_2.first == row_col_3.first);
                    assert(row_col_0.second == row_col_2.second);
                    assert(row_col_1.second == row_col_3.second);
                    
                    size_t & row_0 = row_col_0.first;
                    size_t & row_1 = row_col_2.first;
                    size_t & col_0 = row_col_0.second;
                    size_t & col_1 = row_col_1.second;
                    std::array<size_t, 2> cols = {col_0, col_1};
                    std::array<size_t, 2> rows = {row_0, row_1};
                    denoteRowExcept(row_0, n, cols);
                    denoteRowExcept(row_1, n, cols);
                    
                    denoteColExcept(col_0, n, rows);
                    denoteColExcept(col_1, n, rows);
                }
            }
        }
    };

    for (Num n=1; n<=N; ++n)
    {
        check_xwings(n, toIndexRow);
        // no need to check col,
        //check_xwings(n, toIndexCol);
    }
}

template <size_t N>
void Game<N>::checkSingleLine()
{
    auto & lutGridToIndex = _lutGridToIndex;
    IndexFunc toIndexGrid = [&lutGridToIndex](size_t i, size_t j) -> size_t { return lutGridToIndex[i][j];};
    // for each num
    for ( Num n = 1; n<=N; ++n)
    {
        // for each grid
        for (size_t i =0; i<N; ++i)
        {
            std::vector<size_t> cell_indexes;
            // for each grid cell
            for (size_t j=0; j<N; ++j)
            {
                auto index = toIndexGrid(i,j);
                if (_nums[index]) // skip filled ones
                    continue;
                
                if (_notations[index].contains(n))
                    cell_indexes.push_back(index);
            }
            
            // check single line only possible for 1,2,3
            if (!cell_indexes.empty() && cell_indexes.size()<=3)
            {
                std::vector<std::pair<size_t, size_t>> pairs;
                std::transform(cell_indexes.begin(), cell_indexes.end(), std::back_inserter(pairs), [](auto & index){
                    return ToRowCol<N>(index);
                });
                
                std::set<size_t> row_set;
                std::set<size_t> col_set;
                for ( auto & pair : pairs)
                {
                    row_set.insert(pair.first);
                    col_set.insert(pair.second);
                }
                
                if (row_set.size()==1)
                {
                    size_t single_row = *row_set.begin();
                    denoteRowExcept(single_row, n, col_set);
                    int bp = 1;
                }
                if (col_set.size()==1)
                {
                    size_t single_col = *col_set.begin();
                    denoteColExcept(single_col, n, row_set);
                    int bp = 1;
                }
            }
        }
    }
}

template <size_t N>
template <typename IndexContainer>
void Game<N>::denoteRowExcept(size_t row, Num num, const IndexContainer & exclusion)
{
    for ( size_t col=0;col<N;++col)
    {
        if ( exclusion.end() != std::find(exclusion.begin(), exclusion.end(), col))
            continue;
        
        auto index = ToIndex<N>(row, col);
        if (_nums[index])
            continue;
        
        if (_notations[index].contains(num))
        {
            denote(index, num);
        }
    }
}

template <size_t N>
template <typename IndexContainer>
void Game<N>::denoteColExcept(size_t col, Num num, const IndexContainer & exclusion)
{
    for ( size_t row=0;row<N;++row)
    {
        if ( exclusion.end() != std::find(exclusion.begin(), exclusion.end(), row))
            continue;
        
        auto index = ToIndex<N>(row, col);
        if (_nums[index])
            continue;
        
        if (_notations[index].contains(num))
        {
            denote(index, num);
        }
    }
}

template class Game<4>;
template class Game<6>;
template class Game<9>;
template std::ostream & operator<< <4> (std::ostream & , const Game<4> &);
template std::ostream & operator<< <6> (std::ostream & , const Game<6> &);
template std::ostream & operator<< <9> (std::ostream & , const Game<9> &);

