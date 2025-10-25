'use client'

import { useState, useMemo } from 'react'
import type { NavigationData, NavigationItem, NavigationSubItem } from '@/types/navigation'
import type { SiteConfig } from '@/types/site'
import { NavigationCard } from '@/components/navigation-card'
import { Sidebar } from '@/components/sidebar'
import { SearchBar } from '@/components/search-bar'
import { ModeToggle } from '@/components/mode-toggle'
import { Footer } from '@/components/footer'
import { Github, HelpCircle } from 'lucide-react'
import { Button } from "@/registry/new-york/ui/button"
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Menu } from 'lucide-react'

interface NavigationContentProps {
  navigationData: NavigationData
  siteData: SiteConfig
}

// 创建兼容的类型
type NavigationCardItem = {
  id: string;
  title: string;
  url?: string;
  description?: string;
  // 添加炫彩相关属性（使用类型断言）
  special?: string;
  colorEffect?: string;
}

// 炫彩包装组件 - 处理类型转换
function ColorfulNavigationCard({ item }: { item: NavigationItem | NavigationSubItem }) {
  // 转换为兼容的类型
  const cardItem: NavigationCardItem = {
    id: item.id,
    title: item.title,
    url: (item as any).url, // 使用类型断言访问可能存在的属性
    description: item.description,
    special: (item as any).special,
    colorEffect: (item as any).colorEffect
  }

  const isColorful = (item as any).special === 'colorful' || 
                    (item as any).colorEffect === 'rainbow' ||
                    item.title?.includes('炫彩')

  return (
    <div className={isColorful ? 'colorful-item' : ''}>
      <NavigationCard item={cardItem} />
    </div>
  )
}

export function NavigationContent({ navigationData, siteData }: NavigationContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // 修复类型检查和搜索逻辑
  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    if (!query) return []

    const results: Array<{
      category: NavigationItem
      items: (NavigationItem | NavigationSubItem)[]
      subCategories: Array<{
        title: string
        items: (NavigationItem | NavigationSubItem)[]
      }>
    }> = []

    navigationData.navigationItems.forEach(category => {
      // 搜索主分类下的项目
      const items = (category.items || []).filter(item => {
        const titleMatch = item.title.toLowerCase().includes(query)
        const descMatch = item.description?.toLowerCase().includes(query)
        return titleMatch || descMatch
      })

      // 搜索子分类下的项目
      const subResults: Array<{
        title: string
        items: (NavigationItem | NavigationSubItem)[]
      }> = []

      if (category.subCategories) {
        category.subCategories.forEach(sub => {
          const subItems = (sub.items || []).filter(item => {
            const titleMatch = item.title.toLowerCase().includes(query)
            const descMatch = item.description?.toLowerCase().includes(query)
            return titleMatch || descMatch
          })
          
          if (subItems.length > 0) {
            subResults.push({
              title: sub.title,
              items: subItems
            })
          }
        })
      }

      // 只有当主分类或子分类有匹配结果时才添加到结果中
      if (items.length > 0 || subResults.length > 0) {
        results.push({
          category,
          items,
          subCategories: subResults
        })
      }
    })

    // 调试信息
    if (query && results.length > 0) {
      console.log('搜索结果:', {
        query,
        totalResults: results.length,
        results: results.map(r => ({
          category: r.category.title,
          mainItems: r.items.length,
          subCategories: r.subCategories.map(s => ({
            title: s.title,
            items: s.items.length
          }))
        }))
      })
    }

    return results
  }, [navigationData, searchQuery])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <div className="flex flex-col sm:flex-row min-h-screen">
      <div className="hidden sm:block">
        <Sidebar
          navigationData={navigationData}
          siteInfo={siteData}
          className="sticky top-0 h-screen"
        />
      </div>

      <div className={cn(
        "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm transition-all sm:hidden",
        isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className={cn(
          "fixed inset-y-0 right-0 sm:left-0 w-3/4 max-w-xs bg-background shadow-lg transform transition-transform duration-200 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "translate-x-full sm:-translate-x-full"
        )}>
          <Sidebar
            navigationData={navigationData}
            siteInfo={siteData}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      </div>

      <main className="flex-1">
        <div className="sticky top-0 bg-background/90 backdrop-blur-sm z-30 px-3 sm:px-6 py-2">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar
                navigationData={navigationData}
                onSearch={handleSearch}
                searchResults={searchResults}
                searchQuery={searchQuery}
              />
            </div>
            <div className="flex items-center gap-1">
              <ModeToggle />
              <Link
                href="https://github.com/tianyaxiang/NavSphere"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="访问 GitHub 仓库"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  <Github className="h-5 w-5" />
                </Button>
              </Link>
              <Link
                href="https://mp.weixin.qq.com/s/90LUmKilfLZfc5L63Ej3Sg"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="查看帮助文档"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-6 py-3 sm:py-6">
          <div className="space-y-6">
            {navigationData.navigationItems.map((category) => (
              <section key={category.id} id={category.id} className="scroll-m-16">
                <div className="space-y-4">
                  <h2 className="text-base font-medium tracking-tight">
                    {category.title}
                  </h2>

                  {category.subCategories && category.subCategories.length > 0 ? (
                    category.subCategories.map((subCategory) => (
                      <div key={subCategory.id} id={subCategory.id} className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          {subCategory.title}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {(subCategory.items || []).map((item) => (
                            <ColorfulNavigationCard 
                              key={item.id} 
                              item={item}
                            />
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(category.items || []).map((item) => (
                        <ColorfulNavigationCard 
                          key={item.id} 
                          item={item}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
        {/* 页脚 */}
        <Footer siteInfo={siteData} />
      </main>

      {/* 添加炫彩样式 */}
      <style jsx global>{`
        .colorful-item {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }
        
        .colorful-item::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(
            45deg,
            #ff0000,
            #ff8000,
            #ffff00,
            #00ff00,
            #00ffff,
            #0000ff,
            #8000ff,
            #ff0080,
            #ff0000
          );
          background-size: 400% 400%;
          animation: rainbow 3s ease-in-out infinite;
          border-radius: 14px;
          z-index: 0;
        }
        
        .colorful-item > * {
          position: relative;
          z-index: 1;
        }
        
        @keyframes rainbow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .colorful-item:hover::before {
          animation-duration: 1.5s;
          filter: brightness(1.2);
        }
      `}</style>
    </div>
  )
}
