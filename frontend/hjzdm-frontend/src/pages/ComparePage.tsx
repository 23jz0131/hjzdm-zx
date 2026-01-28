import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import './ComparePage.css';
import { goodsApi, categoryApi, userApi, goodsOperateApi } from '../services/api';

interface Product {
  goodsId?: number;
  goodsName: string;
  goodsPrice: number;
  goodsLink: string;
  imgUrl?: string;
  mallType: number;
}

interface CompareGroup {
  goodsName: string;
  goodsList: Product[];
  lowestPrice: number | null;
  lowestPlatform?: string;
}

const ComparePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  
  // 从 sessionStorage 恢复状态
  const [query, setQuery] = useState(() => {
    const saved = sessionStorage.getItem('comparePage_query');
    return searchParams.get('query') || saved || '';
  });
  
  const [compareGroups, setCompareGroups] = useState<CompareGroup[]>(() => {
    const saved = sessionStorage.getItem('comparePage_compareGroups');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [loading, setLoading] = useState(() => {
    const saved = sessionStorage.getItem('comparePage_loading');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [error, setError] = useState<string | null>(() => {
    const saved = sessionStorage.getItem('comparePage_error');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [sortOption, setSortOption] = useState(() => {
    const saved = sessionStorage.getItem('comparePage_sortOption');
    return saved || 'price_asc';
  });
  
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>(() => {
    const saved = sessionStorage.getItem('comparePage_selectedPlatforms');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [minPrice, setMinPrice] = useState(() => {
    const saved = sessionStorage.getItem('comparePage_minPrice');
    return saved || '';
  });
  
  const [maxPrice, setMaxPrice] = useState(() => {
    const saved = sessionStorage.getItem('comparePage_maxPrice');
    return saved || '';
  });
  
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem('comparePage_currentPage');
    return saved ? parseInt(saved) : 1;
  });
  
  const [pageSize, setPageSize] = useState(() => {
    const saved = sessionStorage.getItem('comparePage_pageSize');
    return saved ? parseInt(saved) : 50;
  });
  
  const [selectedKeys, setSelectedKeys] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('comparePage_selectedKeys');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('comparePage_selectedBrands');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedSeries, setSelectedSeries] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('comparePage_selectedSeries');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedModels, setSelectedModels] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('comparePage_selectedModels');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedStorage, setSelectedStorage] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('comparePage_selectedStorage');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedColors, setSelectedColors] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('comparePage_selectedColors');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedSizes, setSelectedSizes] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('comparePage_selectedSizes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('comparePage_selectedCategories');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [trendOpen, setTrendOpen] = useState(() => {
    const saved = sessionStorage.getItem('comparePage_trendOpen');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [trendLabels, setTrendLabels] = useState<string[]>(() => {
    const saved = sessionStorage.getItem('comparePage_trendLabels');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [trendSeries, setTrendSeries] = useState<number[]>(() => {
    const saved = sessionStorage.getItem('comparePage_trendSeries');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [trendTitle, setTrendTitle] = useState(() => {
    const saved = sessionStorage.getItem('comparePage_trendTitle');
    return saved || '';
  });
  
  const [collectedIds, setCollectedIds] = useState<Set<number>>(() => {
    const saved = sessionStorage.getItem('comparePage_collectedIds');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  
  // Search Source
  const [searchSource, setSearchSource] = useState<'local' | 'compare'>(() => {
    const saved = sessionStorage.getItem('comparePage_searchSource');
    return saved || 'compare';
  });
  
  const [executedQuery, setExecutedQuery] = useState(() => {
    const saved = sessionStorage.getItem('comparePage_executedQuery');
    return saved || '';
  });
  
  const [totalItems, setTotalItems] = useState(() => {
    const saved = sessionStorage.getItem('comparePage_totalItems');
    return saved ? parseInt(saved) : 0;
  });

  // Dynamic Filters State
  const [categories, setCategories] = useState<{ catId: number, catName: string, children?: any[] }[]>([]);
  const [dynamicFilters, setDynamicFilters] = useState<{ id: number, name: string, type: string, attrId: number, attrName: string, values?: string[] }[]>([]);
  const [selectedDynamicFilters, setSelectedDynamicFilters] = useState<Record<string, string>>({});
  const [currentCatId, setCurrentCatId] = useState<number | null>(null);

  // 保存状态到 sessionStorage
  useEffect(() => {
    sessionStorage.setItem('comparePage_query', query);
  }, [query]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_compareGroups', JSON.stringify(compareGroups));
  }, [compareGroups]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_loading', JSON.stringify(loading));
  }, [loading]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_error', JSON.stringify(error));
  }, [error]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_sortOption', sortOption);
  }, [sortOption]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_selectedPlatforms', JSON.stringify(selectedPlatforms));
  }, [selectedPlatforms]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_minPrice', minPrice);
  }, [minPrice]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_maxPrice', maxPrice);
  }, [maxPrice]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_currentPage', currentPage.toString());
  }, [currentPage]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_pageSize', pageSize.toString());
  }, [pageSize]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_selectedKeys', JSON.stringify(selectedKeys));
  }, [selectedKeys]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_selectedBrands', JSON.stringify(selectedBrands));
  }, [selectedBrands]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_selectedSeries', JSON.stringify(selectedSeries));
  }, [selectedSeries]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_selectedModels', JSON.stringify(selectedModels));
  }, [selectedModels]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_selectedStorage', JSON.stringify(selectedStorage));
  }, [selectedStorage]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_selectedColors', JSON.stringify(selectedColors));
  }, [selectedColors]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_selectedSizes', JSON.stringify(selectedSizes));
  }, [selectedSizes]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_selectedCategories', JSON.stringify(selectedCategories));
  }, [selectedCategories]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_trendOpen', JSON.stringify(trendOpen));
  }, [trendOpen]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_trendLabels', JSON.stringify(trendLabels));
  }, [trendLabels]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_trendSeries', JSON.stringify(trendSeries));
  }, [trendSeries]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_trendTitle', trendTitle);
  }, [trendTitle]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_collectedIds', JSON.stringify(Array.from(collectedIds)));
  }, [collectedIds]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_searchSource', searchSource);
  }, [searchSource]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_executedQuery', executedQuery);
  }, [executedQuery]);
  
  useEffect(() => {
    sessionStorage.setItem('comparePage_totalItems', totalItems.toString());
  }, [totalItems]);
  
  // Fetch categories on mount
  useEffect(() => {
    categoryApi.getList().then(res => {
      if (res.data.code === 200) {
        setCategories(res.data.data);
      }
    }).catch(err => console.warn("Failed to fetch categories", err));
  }, []);

  // 仅在页面加载时，如果有URL参数，则执行搜索
  useEffect(() => {
    if (query.trim()) {
      searchProducts(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch dynamic attributes when category changes
  useEffect(() => {
    if (currentCatId) {
      categoryApi.getAttributes(currentCatId).then(res => {
        if (res.data.code === 200) {
          setDynamicFilters(res.data.data);
        }
      }).catch(err => console.warn("Failed to fetch attributes", err));
    } else {
      setDynamicFilters([]);
    }
  }, [currentCatId]);

  // Auto-search when filters change (Local Mode only)
  useEffect(() => {
    if (searchSource === 'local') {
      searchProducts(executedQuery || query);
    }
  }, [selectedDynamicFilters, currentCatId, currentPage, pageSize, searchSource, selectedPlatforms]);

  useEffect(() => {
    (async () => {
      try {
        const res = await goodsApi.getMyCollect(1, 500);
        if (res.data && res.data.code === 200 && Array.isArray(res.data.data)) {
          const ids = res.data.data.map((g: { goodsId: number }) => g.goodsId).filter((id: number) => typeof id === 'number');
          setCollectedIds(new Set(ids));
        }
      } catch (e) {
      }
    })();
  }, []);

  const toggleCollect = async (goodsId: number) => {
    try {
      if (collectedIds.has(goodsId)) {
        const res = await goodsOperateApi.cancelCollect(goodsId);
        if (res.data && res.data.code === 200) {
          setCollectedIds(prev => {
            const next = new Set(prev);
            next.delete(goodsId);
            return next;
          });
        }
      } else {
        const res = await goodsOperateApi.collect(goodsId);
        if (res.data && res.data.code === 200) {
          setCollectedIds(prev => {
            const next = new Set(prev);
            next.add(goodsId);
            return next;
          });
        } else {
          alert('请先登录');
        }
      }
    } catch (e) {
      alert('操作失败');
    }
  };

  const ensureGoodsIdAndCollect = async (product: Product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('请先登录');
        return;
      }
      if (product.goodsId) {
        await toggleCollect(product.goodsId);
        return;
      }
      const payload: { goodsName: string, goodsPrice: number, goodsLink: string, imgUrl: string, mallType: number, status: number } = {
        goodsName: product.goodsName,
        goodsPrice: product.goodsPrice,
        goodsLink: product.goodsLink,
        imgUrl: product.imgUrl || '',
        mallType: product.mallType,
        status: 1
      };
      const addRes = await goodsApi.addAndReturn(payload);
      if (addRes.data && addRes.data.code === 200 && addRes.data.data && addRes.data.data.goodsId) {
        const newId = addRes.data.data.goodsId as number;
        await toggleCollect(newId);
      } else {
        alert('新增商品失败');
      }
    } catch (e) {
      alert('操作失败');
    }
  };

  const ensureGoodsIdAndHistory = async (product: Product, event?: React.MouseEvent) => {
    // 直接跳转，不再记录浏览历史
    const targetUrl = product.goodsLink;
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const searchProducts = async (searchQuery: string) => {
    // Debug log removed
    if (!searchQuery.trim() && searchSource === 'compare') return;

    setExecutedQuery(searchQuery);
    setLoading(true);
    setError(null);

    try {
      if (searchSource === 'local') {
        const minP = minPrice ? Number(minPrice) : undefined;
        const maxP = maxPrice ? Number(maxPrice) : undefined;
        // Debug log removed
        const response = await goodsApi.getGoodsPage(searchQuery, selectedDynamicFilters, currentCatId || undefined, currentPage, pageSize, minP, maxP, selectedPlatforms);
        // Debug log removed

        if (response.data && response.data.code === 200) {
          const records = response.data.data.records || [];
          setTotalItems(response.data.data.total || 0);
          const processedData = records.map((g: { goodsId: number, goodsName: string, goodsPrice: number, goodsLink: string, imgUrl: string, mallType: number }) => ({
            goodsName: g.goodsName,
            goodsList: [{
              goodsId: g.goodsId,
              goodsName: g.goodsName,
              goodsPrice: g.goodsPrice,
              goodsLink: g.goodsLink || '#',
              imgUrl: g.imgUrl,
              mallType: g.mallType || 0
            }],
            lowestPrice: g.goodsPrice,
            lowestPlatform: getPlatformName(g.mallType || 0)
          }));
          if (processedData.length === 0) {
            try {
              const cmpRes = await goodsApi.compareGoods(searchQuery);
              let responseData: { goodsName: string, goodsList: any[], lowestPrice: number, lowestPlatform: string }[] = [];
              if (cmpRes.data && cmpRes.data.data) {
                responseData = Array.isArray(cmpRes.data.data) ? cmpRes.data.data : [cmpRes.data.data];
              }
              let cmpProcessed: { goodsName: string, goodsList: any[], lowestPrice: number, lowestPlatform: string }[] = [];
              if (responseData.length > 0) {
                cmpProcessed = responseData.map((group: { goodsName: string, goodsList: any[], lowestPrice: number, lowestPlatform: string }) => {
                  const goodsList = Array.isArray(group.goodsList) ? group.goodsList : [];
                  let lowestPrice: number | null = null;
                  let lowestPlatform = '不明';
                  if (goodsList.length > 0) {
                    const lowestProduct = goodsList.reduce((lowest: any, current: any) =>
                      current.goodsPrice < lowest.goodsPrice ? current : lowest, goodsList[0]);
                    lowestPrice = lowestProduct.goodsPrice;
                    lowestPlatform = getPlatformName(lowestProduct.mallType);
                  }
                  return {
                    goodsName: group.goodsName || '不明な商品',
                    goodsList: goodsList.map((product: any) => ({
                      goodsId: product.goodsId,
                      goodsName: product.goodsName,
                      goodsPrice: product.goodsPrice,
                      goodsLink: product.goodsLink,
                      imgUrl: product.imgUrl || '',
                      mallType: product.mallType
                    })),
                    lowestPrice: lowestPrice || 0,
                    lowestPlatform
                  };
                });
              }
              setCompareGroups(cmpProcessed);
              setLoading(false);
              return;
            } catch (e) {
              console.warn('Fallback compare search failed', e);
            }
          }
          setCompareGroups(processedData);
        } else {
          setCompareGroups([]);
          setTotalItems(0);
          try {
            const cmpRes = await goodsApi.compareGoods(searchQuery);
            let responseData: { goodsName: string, goodsList: any[], lowestPrice: number, lowestPlatform: string }[] = [];
            if (cmpRes.data && cmpRes.data.data) {
              responseData = Array.isArray(cmpRes.data.data) ? cmpRes.data.data : [cmpRes.data.data];
            }
            let processedData: { goodsName: string, goodsList: any[], lowestPrice: number, lowestPlatform: string }[] = [];
            if (responseData.length > 0) {
              processedData = responseData.map((group: { goodsName: string, goodsList: any[], lowestPrice: number | null, lowestPlatform: string }) => {
                const goodsList = Array.isArray(group.goodsList) ? group.goodsList : [];
                let lowestPrice: number | null = null;
                let lowestPlatform = '不明';
                if (goodsList.length > 0) {
                  const lowestProduct = goodsList.reduce((lowest: { goodsPrice: number, mallType?: number }, current: { goodsPrice: number, mallType?: number }) =>
                    current.goodsPrice < lowest.goodsPrice ? current : lowest, goodsList[0]);
                  lowestPrice = lowestProduct.goodsPrice;
                  lowestPlatform = getPlatformName((lowestProduct as any).mallType || 0);
                }
                return {
                  goodsName: group.goodsName || '不明な商品',
                  goodsList: goodsList.map((product: { goodsId: number, goodsName: string, goodsPrice: number, goodsLink: string, imgUrl: string, mallType: number }) => ({
                    goodsId: product.goodsId,
                    goodsName: product.goodsName,
                    goodsPrice: product.goodsPrice,
                    goodsLink: product.goodsLink,
                    imgUrl: product.imgUrl,
                    mallType: product.mallType
                  })),
                  lowestPrice: lowestPrice || 0,
                  lowestPlatform
                };
              });
            }
            setCompareGroups(processedData);
          } catch (e) {
            console.warn('Fallback compare search failed', e);
          }
        }
        setLoading(false);
        return;
      }

      // デバッグ用ログ removed

      // 使用api.ts中定义的API服务
      const response = await goodsApi.compareGoods(searchQuery);

      // デバッグ用ログ removed

      let responseData = [];
      if (response.data && response.data.data) {
        responseData = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
      } else {
        responseData = [];
      }

      // デバッグ用ログ removed

      // レスポンスデータを処理
      let processedData: { goodsName: string, goodsList: { goodsId: number, goodsName: string, goodsPrice: number, goodsLink: string, imgUrl: string, mallType: number }[], lowestPrice: number, lowestPlatform: string }[] = [];

      if (responseData.length > 0) {
        // APIが返すグループデータを適切に処理
        processedData = responseData.map((group: { goodsName: string, goodsList: { goodsId: number, goodsName: string, goodsPrice: number, goodsLink: string, imgUrl: string, mallType: number }[], lowestPrice: number, lowestPlatform: string }) => {
          // グループ内の商品リストを処理
          const goodsList = Array.isArray(group.goodsList) ? group.goodsList : [];

          // 最低価格とプラットフォームを特定
          let lowestPrice = null;
          let lowestPlatform = '不明';

          // 最低価格を計算
          if (goodsList.length > 0) {
            const lowestProduct = goodsList.reduce((lowest: any, current: any) =>
              current.goodsPrice < lowest.goodsPrice ? current : lowest, goodsList[0]);

            lowestPrice = lowestProduct.goodsPrice;
            lowestPlatform = getPlatformName(lowestProduct.mallType);
          }

          return {
            goodsName: group.goodsName || '不明な商品',
            goodsList: goodsList.map((product: { goodsId: number, goodsName: string, goodsPrice: number, goodsLink: string, imgUrl: string, mallType: number }) => ({
              goodsId: product.goodsId,
              goodsName: product.goodsName,
              goodsPrice: product.goodsPrice,
              goodsLink: product.goodsLink,
              imgUrl: product.imgUrl,
              mallType: product.mallType
            })),
            lowestPrice: lowestPrice || 0,
            lowestPlatform: lowestPlatform
          };
        });

        // デバッグ用ログ removed
      }

      // Fallback: if compare returns empty, try local catalog search
      if (processedData.length === 0) {
        try {
          const localRes = await goodsApi.getGoodsPage(
            searchQuery,
            undefined,
            undefined,
            currentPage,
            pageSize,
            undefined,
            undefined,
            selectedPlatforms
          );
          if (localRes.data && localRes.data.code === 200) {
            const records = localRes.data.data?.records || [];
            setTotalItems(localRes.data.data?.total || 0);
            processedData = records.map((g: { goodsId: number, goodsName: string, goodsPrice: number, goodsLink: string, imgUrl: string, mallType: number }) => ({
              goodsName: g.goodsName,
              goodsList: [{
                goodsId: g.goodsId,
                goodsName: g.goodsName,
                goodsPrice: g.goodsPrice,
                goodsLink: g.goodsLink || '#',
                imgUrl: g.imgUrl,
                mallType: g.mallType || 0
              }],
              lowestPrice: g.goodsPrice,
              lowestPlatform: getPlatformName(g.mallType || 0)
            }));
          }
          // If still empty, try name-based search as last resort
          if (processedData.length === 0) {
            try {
              const byNameRes = await goodsApi.searchGoodsByName(searchQuery);
              const list = (byNameRes.data && byNameRes.data.data)
                ? (Array.isArray(byNameRes.data.data) ? byNameRes.data.data : [byNameRes.data.data])
                : [];
              processedData = list.map((g: { goodsId: number, goodsName: string, goodsPrice: number, goodsLink: string, imgUrl: string, mallType: number }) => ({
                goodsName: g.goodsName,
                goodsList: [{
                  goodsId: g.goodsId,
                  goodsName: g.goodsName,
                  goodsPrice: g.goodsPrice,
                  goodsLink: g.goodsLink || '#',
                  imgUrl: g.imgUrl,
                  mallType: g.mallType || 0
                }],
                lowestPrice: g.goodsPrice,
                lowestPlatform: getPlatformName(g.mallType || 0)
              }));
            } catch (e) {
              console.warn('Name-based fallback search failed', e);
            }
          }
        } catch (e) {
          console.warn('Local catalog fallback search failed', e);
        }
      }

      // デバッグ用ログ removed

      setCompareGroups(processedData);
      setLoading(false);
    } catch (err) {
      try {
        let processedData: { goodsName: string, goodsList: { goodsId: number, goodsName: string, goodsPrice: number, goodsLink: string, imgUrl: string, mallType: number }[], lowestPrice: number, lowestPlatform: string }[] = [];
        const searchRes = await goodsApi.searchGoods(searchQuery);
        const list = (searchRes.data && searchRes.data.data)
          ? (Array.isArray(searchRes.data.data) ? searchRes.data.data : [searchRes.data.data])
          : [];
        processedData = list.map((g: { goodsId: number, goodsName: string, goodsPrice: number, goodsLink: string, imgUrl: string, mallType: number }) => ({
          goodsName: g.goodsName,
          goodsList: [{
            goodsId: g.goodsId,
            goodsName: g.goodsName,
            goodsPrice: g.goodsPrice,
            goodsLink: g.goodsLink || '#',
            imgUrl: g.imgUrl,
            mallType: g.mallType || 0
          }],
          lowestPrice: g.goodsPrice,
          lowestPlatform: getPlatformName(g.mallType || 0)
        }));
        if (processedData.length === 0) {
          const byNameRes = await goodsApi.searchGoodsByName(searchQuery);
          const byNameList = (byNameRes.data && byNameRes.data.data)
            ? (Array.isArray(byNameRes.data.data) ? byNameRes.data.data : [byNameRes.data.data])
            : [];
          processedData = byNameList.map((g: { goodsId: number, goodsName: string, goodsPrice: number, goodsLink: string, imgUrl: string, mallType: number }) => ({
            goodsName: g.goodsName,
            goodsList: [{
              goodsId: g.goodsId,
              goodsName: g.goodsName,
              goodsPrice: g.goodsPrice,
              goodsLink: g.goodsLink || '#',
              imgUrl: g.imgUrl,
              mallType: g.mallType || 0
            }],
            lowestPrice: g.goodsPrice,
            lowestPlatform: getPlatformName(g.mallType || 0)
          }));
        }
        setCompareGroups(processedData);
      } catch (fallbackErr) {
        setError('検索に失敗しました。後ほど再試行してください');
        console.warn(fallbackErr);
      } finally {
        setLoading(false);
      }
      console.warn(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      searchProducts(query);
    }
  };

  const getPlatformName = (mallType: number): string => {
    switch (mallType) {
      case 10: return '楽天';
      case 20: return 'Yahoo!';
      case 40: return 'Amazon';
      default: return '其他';
    }
  };

  const getPlatformColor = (mallType: number): string => {
    switch (mallType) {
      case 10: return '#bf0000'; // Rakuten Red
      case 20: return '#ff0033'; // Yahoo Red
      case 40: return '#FF9900'; // Amazon Orange
      default: return '#666';
    }
  };

  const getPlatformBadgeClass = (mallType: number): string => {
    switch (mallType) {
      case 10: return 'platform-badge rakuten';
      case 20: return 'platform-badge yahoo';
      case 40: return 'platform-badge amazon';
      default: return 'platform-badge unknown';
    }
  };

  const allProducts: Product[] = compareGroups.flatMap(group => group.goodsList);
  const normalizedQuery = (executedQuery || query || '').toLowerCase();
  const buildSearchTokens = (q: string): string[] => {
    const n = (q || '').toLowerCase().trim();
    if (!n) return [];
    const baseParts = n.split(/[\s、，,。]+/).map(s => s.trim()).filter(Boolean);
    const splitToken = (t: string): string[] => {
      const res: string[] = [];
      let current = '';
      let currentType: 'latin' | 'other' | null = null;
      for (const ch of t) {
        const isLatin = /[a-z0-9]/i.test(ch);
        const type: 'latin' | 'other' = isLatin ? 'latin' : 'other';
        if (currentType === null || currentType === type) {
          current += ch;
          currentType = type;
        } else {
          if (current.length > 0) {
            res.push(current);
          }
          current = ch;
          currentType = type;
        }
      }
      if (current.length > 0) {
        res.push(current);
      }
      return res;
    };
    const allParts: string[] = [];
    baseParts.forEach(p => {
      const parts = splitToken(p);
      if (parts.length > 0) {
        allParts.push(...parts);
      } else {
        allParts.push(p);
      }
    });
    const deduped = Array.from(new Set(allParts));
    return deduped.filter(p => p.length >= 2);
  };
  const searchTokens = buildSearchTokens(normalizedQuery);
  const hasDeviceKeyword = /iphone|galaxy|xiaomi|huawei|pixel|xperia|ipad|macbook|thinkpad|notebook|laptop|surface|switch|playstation|ps5|xbox|tv|bravia|regza|monitor|display|camera|eos|alpha|冷蔵庫|冰箱|洗濯機|洗衣机|airpods|buds/i.test(normalizedQuery);
  const hasAccessoryKeyword = /ケース|カバー|フィルム|充電器|ケーブル|保護|スタンド|ガラス|バンパー|壳|膜|支架|充電器|アダプタ|adapter|case|cover|charger|cable|ストラップ|ホルダー|dock|ドック|イヤホン|ヘッドホン/i.test(normalizedQuery);
  const shouldFilterAccessories = hasDeviceKeyword && !hasAccessoryKeyword;
  const isAccessoryProduct = (name: string) => {
    const n = (name || '').toLowerCase();
    return /ケース|カバー|フィルム|充電器|ケーブル|保護|スタンド|ガラス|バンパー|ストラップ|ホルダー|dock|ドック|adapter|アダプタ|イヤホン|ヘッドホン|screen protector|case|cover|charger|cable/.test(n);
  };
  const knownBrands = ['Apple', 'Samsung', 'Sony', 'Xiaomi', 'Huawei', 'Lenovo', 'Dell', 'HP', 'ASUS', 'Acer', 'Nintendo', 'Microsoft', 'Canon', 'Nikon'];
  const parseFacets = (name: string) => {
    const n = name || '';
    const brand = knownBrands.find(b => new RegExp(b, 'i').test(n)) || '';
    const seriesMatch = n.match(/(iPhone|MacBook|iPad|Galaxy|ThinkPad|Surface|PlayStation|Switch|WH\-\d{4}XM\d|RX\s?\d{3,}|EOS\s?\w+)/i);
    const series = seriesMatch ? seriesMatch[1] : '';
    const modelMatch = n.match(/([A-Za-z]{1,3}\-?\d{2,4}[A-Za-z]?|\bPro Max\b|\bPro\b|\bUltra\b|\bPlus\b|\bAir\b|\bMini\b)/i);
    const model = modelMatch ? modelMatch[1] : '';
    const storageMatch = n.match(/(\b\d{2,4}\s?(GB|TB)\b)/i);
    const storage = storageMatch ? storageMatch[1].replace(/\s+/g, '') : '';
    const colorMatch = n.match(/\b(Black|White|Silver|Blue|Red|Green|Gold|Pink|Gray|Space Gray|Midnight|ブラック|ホワイト|シルバー|ブルー|レッド|グリーン|ゴールド|ピンク|グレー|スペースグレイ|ミッドナイト)\b/i);
    const color = colorMatch ? colorMatch[1] : '';
    const sizeMatch = n.match(/(\b\d{1,2}(?:\.\d)?\s?(?:吋|インチ|"|英寸)\b)/);
    const size = sizeMatch ? sizeMatch[1] : '';
    return { brand, series, model, storage, color, size };
  };
  const facetIndex = allProducts.map(p => parseFacets(p.goodsName));
  const brands = Array.from(new Set(facetIndex.map(f => f.brand).filter(Boolean)));
  const series = Array.from(new Set(facetIndex.map(f => f.series).filter(Boolean)));
  const models = Array.from(new Set(facetIndex.map(f => f.model).filter(Boolean)));
  const storages = Array.from(new Set(facetIndex.map(f => f.storage).filter(Boolean)));
  const colors = Array.from(new Set(facetIndex.map(f => f.color).filter(Boolean)));
  const sizes = Array.from(new Set(facetIndex.map(f => f.size).filter(Boolean)));
  const parseCategory = (name: string) => {
    const n = (name || '').toLowerCase();
    if (/手机壳|ケース|保护壳|カバー/.test(n)) return { parent: 'スマホアクセサリー', child: 'ケース' };
    if (/iphone|galaxy|xiaomi|huawei|pixel|xperia/.test(n)) return { parent: '携帯電話・スマートフォン', child: 'スマートフォン本体' };
    if (/ipad|galaxy tab|surface|tablet/.test(n)) return { parent: 'パソコン・タブレット', child: 'タブレットPC' };
    if (/macbook|thinkpad|notebook|laptop/.test(n)) return { parent: 'パソコン・タブレット', child: 'ノートパソコン' };
    if (/monitor|display|显示器/.test(n)) return { parent: 'パソコン周辺機器', child: 'モニター' };
    if (/mouse|keyboard|鼠标|键盘/.test(n)) return { parent: 'パソコン周辺機器', child: 'キーボード・マウス' };
    if (/airpods|buds|wh-|wf-|耳机/.test(n)) return { parent: 'オーディオ・楽器', child: 'ヘッドホン・イヤホン' };
    if (/tv|bravia|regza|电视/.test(n)) return { parent: 'テレビ・映像機器', child: 'テレビ' };
    if (/camera|eos|alpha|相机/.test(n)) return { parent: 'カメラ', child: 'デジタルカメラ' };
    if (/lens|镜头/.test(n)) return { parent: 'カメラ', child: 'レンズ' };
    if (/fridge|refrigerator|冰箱/.test(n)) return { parent: '生活家電', child: '冷蔵庫' };
    if (/washing|washer|洗衣机/.test(n)) return { parent: '生活家電', child: '洗濯機' };
    return { parent: 'その他', child: 'その他' };
  };

  const categoriesAll = Array.from(new Set(allProducts.map(p => {
    const c = parseCategory(p.goodsName);
    return `${c.parent}>${c.child}`;
  }).filter(x => x !== '其他>其他')));

  // Build hierarchy tree
  const categoryTree: Record<string, string[]> = {};
  categoriesAll.forEach(c => {
    const [p, child] = c.split('>');
    if (!categoryTree[p]) categoryTree[p] = [];
    if (!categoryTree[p].includes(child)) categoryTree[p].push(child);
  });

  const filteredProducts: Product[] = allProducts.filter(p => {
    const platformOk = selectedPlatforms.length === 0 || selectedPlatforms.includes(p.mallType);
    const minOk = minPrice === '' || (!isNaN(Number(minPrice)) && p.goodsPrice >= Number(minPrice));
    const maxOk = maxPrice === '' || (!isNaN(Number(maxPrice)) && p.goodsPrice <= Number(maxPrice));
    const f = parseFacets(p.goodsName);
    const brandOk = selectedBrands.length === 0 || (f.brand && selectedBrands.includes(f.brand));
    const seriesOk = selectedSeries.length === 0 || (f.series && selectedSeries.includes(f.series));
    const modelOk = selectedModels.length === 0 || (f.model && selectedModels.includes(f.model));
    const storageOk = selectedStorage.length === 0 || (f.storage && selectedStorage.includes(f.storage));
    const colorOk = selectedColors.length === 0 || (f.color && selectedColors.includes(f.color));
    const sizeOk = selectedSizes.length === 0 || (f.size && selectedSizes.includes(f.size));

    const cat = parseCategory(p.goodsName);
    const catStr = `${cat.parent}>${cat.child}`;
    const categoryOk = selectedCategories.length === 0 ||
      selectedCategories.some(sc => sc === cat.parent || sc === catStr);

    const validData = p.goodsPrice > 0 && p.goodsLink && p.goodsLink !== '#' && p.goodsLink !== '';
    const accessoryOk = !shouldFilterAccessories || !isAccessoryProduct(p.goodsName);
    const nameLower = (p.goodsName || '').toLowerCase();
    const keywordOk = searchTokens.length === 0 || searchTokens.every(t => nameLower.includes(t));

    return platformOk && minOk && maxOk && brandOk && seriesOk && modelOk && storageOk && colorOk && sizeOk && categoryOk && validData && accessoryOk && keywordOk;
  });
  const sortedProducts: Product[] = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price_asc') return a.goodsPrice - b.goodsPrice;
    if (sortOption === 'price_desc') return b.goodsPrice - a.goodsPrice;
    if (sortOption === 'platform') return a.mallType - b.mallType;
    if (sortOption === 'name') return a.goodsName.localeCompare(b.goodsName);
    return 0;
  });
  const togglePlatform = (mt: number) => {
    setSelectedPlatforms(prev => prev.includes(mt) ? prev.filter(x => x !== mt) : [...prev, mt]);
  };

  const totalPages = searchSource === 'local'
    ? Math.max(1, Math.ceil(totalItems / pageSize))
    : Math.max(1, Math.ceil(sortedProducts.length / pageSize));

  const currentPageProducts = searchSource === 'local'
    ? sortedProducts
    : sortedProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const goPrev = () => setCurrentPage(p => Math.max(1, p - 1));
  const goNext = () => setCurrentPage(p => Math.min(totalPages, p + 1));
  const onChangePageSize = (size: number) => { setPageSize(size); setCurrentPage(1); };

  const getSelectKey = (p: Product) => {
    if (p.goodsId) return `id:${p.goodsId}`;
    const base = `${p.mallType}-${p.goodsLink || ''}-${p.goodsName}`;
    return `k:${base}`;
  };
  const isSelected = (key: string) => selectedKeys.includes(key);
  const toggleSelect = (p: Product) => {
    const key = getSelectKey(p);
    setSelectedKeys(prev => prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]);
  };

  const getSellerFromLink = (url?: string) => {
    if (!url) return '不明な店铺';
    try {
      const u = new URL(url.startsWith('http') ? url : ('https://' + url.replace(/^\/\//, '')));
      return u.hostname.replace(/^www\./, '');
    } catch {
      return '不明な店铺';
    }
  };

  // 清理函数 - 可选，如果想在页面卸载时清除存储数据
  useEffect(() => {
    return () => {
      // 这里可以选择清除部分存储的数据，或者保留它们以供下次访问
      // 例如，我们可以保留搜索结果，但清除加载状态
      sessionStorage.setItem('comparePage_loading', 'false');
    };
  }, []);

  return (
    <div className="compare-page">
      <div className="search-section">
        <h1>商品価格比較</h1>
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)} // 仅更新状态，不触发搜索
            placeholder="商品名を入力して価格比較..."
            className="search-input"
          />
          <button type="submit" className="search-button">搜索</button>
        </form>
      </div>

      {loading && <div className="loading">検索中...</div>}
      {error && <div className="error">{error}</div>}

      {/* Show container if not loading/error, OR if we have results, OR to show sidebar even when empty */}
      {!loading && !error && (
        <div className="compare-container">
          {/* Sidebar Filters */}
          <div className="sidebar">
            {/* Category Tree (Local Mode) removed by request */}

            {/* Dynamic Filters (Local Mode + Category Selected) */}
            {searchSource === 'local' && dynamicFilters.length > 0 && (
              <div className="sidebar-section dynamic-filters">
                <h3 className="sidebar-title">属性筛选</h3>
                {dynamicFilters.map(attr => (
                  <div key={attr.id} className="filter-group">
                    <h4>{attr.name}</h4>
                    <ul className="filter-options">
                      {(attr as any).values && (attr as any).values.map((val: string) => (
                        <li key={val}>
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedDynamicFilters[attr.id] === val}
                              onChange={() => {
                                setSelectedDynamicFilters(prev => {
                                  if (prev[attr.id] === val) {
                                    const next = { ...prev };
                                    delete next[attr.id];
                                    return next;
                                  }
                                  return { ...prev, [attr.id]: val };
                                });
                              }}
                            />
                            {val}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Compare mode category filters removed by request */}

            <div className="sidebar-section">
              <h3 className="sidebar-title">价格区间</h3>
              <div className="price-range-inputs">
                <input type="number" placeholder="¥ min" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <span>-</span>
                <input type="number" placeholder="¥ max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>

            <div className="sidebar-section">
              <h3 className="sidebar-title">商城</h3>
              <ul className="filter-list">
                <li><label><input type="checkbox" checked={selectedPlatforms.includes(10)} onChange={() => togglePlatform(10)} /> 楽天</label></li>
                <li><label><input type="checkbox" checked={selectedPlatforms.includes(20)} onChange={() => togglePlatform(20)} /> Yahoo!ショッピング</label></li>
              </ul>
            </div>
          </div>

          {/* Main Content Results */}
          <div className="main-content">
            <div className="results-header">
              <h2>"{query}" 搜索结果 <span>({filteredProducts.length}件)</span></h2>
              <div className="sort-bar">
                <span className="sort-label">排序:</span>
                <button className={`sort-tab ${sortOption === 'price_asc' ? 'active' : ''}`} onClick={() => setSortOption('price_asc')}>价格低到高</button>
                <button className={`sort-tab ${sortOption === 'price_desc' ? 'active' : ''}`} onClick={() => setSortOption('price_desc')}>价格高到低</button>
                <button className={`sort-tab ${sortOption === 'platform' ? 'active' : ''}`} onClick={() => setSortOption('platform')}>商城</button>
              </div>
            </div>

            <div className="product-list-view">
              {currentPageProducts.map((product, index) => (
                <div key={index} className="product-row">
                  <div className="p-image">
                    <img src={product.imgUrl || '/images/default-product.png'} alt={product.goodsName} onError={(e) => (e.target as HTMLImageElement).src = '/images/default-product.png'} />
                  </div>
                  <div className="p-info">
                    <div className="p-title-row">
                      <a
                        href={product.goodsLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-title"
                        onClick={(e) => { ensureGoodsIdAndHistory(product, e); }}
                      >
                        {product.goodsName}
                      </a>
                    </div>
                    <div className="p-specs">
                      {(function () {
                        const f = parseFacets(product.goodsName);
                        const parts = [f.brand, f.series, f.model, f.storage, f.color, f.size].filter(Boolean);
                        return parts.join(' | ');
                      })()}
                    </div>
                    <div className="p-meta">
                      <span className={`mall-tag mall-${product.mallType}`}>{getPlatformName(product.mallType)}</span>
                      <span className="seller">{getSellerFromLink(product.goodsLink)}</span>
                    </div>
                  </div>
                  <div className="p-action">
                    <div className="p-price">{product.goodsPrice.toLocaleString()}円</div>
                    <a
                      href={product.goodsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-shop"
                      onClick={(e) => { ensureGoodsIdAndHistory(product, e); }}
                    >
                      前往购买
                    </a>
                    <button className="btn-trend" onClick={() => { ensureGoodsIdAndCollect(product); }}>{product.goodsId && collectedIds.has(product.goodsId) ? '取消收藏' : '收藏'}</button>
                    <button className="btn-trend" onClick={() => {
                      const title = product.goodsName;
                      const labels = Array.from({ length: 12 }, (_, i) => {
                        const d = new Date();
                        d.setMonth(d.getMonth() - (11 - i));
                        const m = (d.getMonth() + 1).toString().padStart(2, '0');
                        return `${d.getFullYear()}-${m}`;
                      });
                      const base = Math.max(1, product.goodsPrice);
                      let val = base * 1.0;
                      const series = labels.map((_, i) => {
                        const drift = 1 + Math.sin(i / 3) * 0.05;
                        const noise = 1 + ((Math.random() - 0.5) * 0.08);
                        val = Math.max(1, val * drift * noise);
                        return Math.round(val);
                      });
                      setTrendTitle(title);
                      setTrendLabels(labels);
                      setTrendSeries(series);
                      setTrendOpen(true);
                    }}>价格走势</button>
                    <label className="compare-check">
                      <input type="checkbox" checked={isSelected(getSelectKey(product))} onChange={() => toggleSelect(product)} /> 对比
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="pagination-controls">
              <button type="button" onClick={goPrev} disabled={currentPage === 1}>上一页</button>
              <span className="page-info">{currentPage} / {totalPages}</span>
              <button type="button" onClick={goNext} disabled={currentPage === totalPages}>下一页</button>
            </div>
          </div>

          {trendOpen && (
            <div className="price-trend-modal" onClick={() => setTrendOpen(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <span className="modal-title">{trendTitle}</span>
                  <button type="button" className="modal-close" onClick={() => setTrendOpen(false)}>×</button>
                </div>
                <div className="modal-body">
                  <div className="trend-chart">
                    {(function () {
                      const width = 600;
                      const height = 280;
                      const padding = 32;
                      const xs = trendSeries.map((_, i) => padding + (i * (width - 2 * padding)) / (trendSeries.length - 1));
                      const minV = Math.min(...trendSeries);
                      const maxV = Math.max(...trendSeries);
                      const ys = trendSeries.map(v => height - padding - ((v - minV) / (Math.max(1, maxV - minV))) * (height - 2 * padding));
                      const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
                      const gridY = [0.25, 0.5, 0.75].map(r => height - padding - r * (height - 2 * padding));
                      return (
                        <svg width={width} height={height} role="img" aria-label="价格趋势图">
                          {gridY.map((gy, i) => (
                            <line key={i} x1={padding} y1={gy} x2={width - padding} y2={gy} stroke="#eee" />
                          ))}
                          <path d={path} fill="none" stroke="#ff4400" strokeWidth={2} />
                          {xs.map((x, i) => (
                            <circle key={i} cx={x} cy={ys[i]} r={3} fill="#ff4400" />
                          ))}
                          <text x={padding} y={height - 8} fontSize={12} fill="#999">{trendLabels[0]}</text>
                          <text x={width - padding - 60} y={height - 8} fontSize={12} fill="#999">{trendLabels[trendLabels.length - 1]}</text>
                        </svg>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !error && compareGroups.length === 0 && query && (
        <div className="no-results">関連商品が見つかりません</div>
      )}
    </div>
  );
};

export default ComparePage;
