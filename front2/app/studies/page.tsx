"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Users } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import axios, { AxiosResponse, AxiosError } from 'axios'; // Import axios types

// 스터디 타입 정의
interface Study {
  id: number
  title: string
  description: string
  category: string
  location: string
  memberCount: number
  maxMembers: number
}

// 카테고리 목록
const categories = ["전체", "프로그래밍", "외국어", "취업 준비", "자격증", "독서", "기타"]

export default function StudiesPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") || "전체"

  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)

  // 스터디 목록 가져오기 (실제로는 API 호출)
  useEffect(() => {
    // 실제 구현에서는 axios를 사용하여 백엔드에서 데이터를 가져옵니다
    axios.get('/api/studies', {
      params: {
        category: selectedCategory !== '전체' ? selectedCategory : undefined,
        search: searchTerm || undefined
      }
    })
      .then((response: AxiosResponse<Study[]>) => {
        setStudies(response.data);
        setLoading(false);
      })
      .catch((error: AxiosError) => {
        console.error('스터디 목록을 불러오는데 실패했습니다:', error);
        setLoading(false);
      });

    // 백엔드 연결 전 더미 데이터
    // setLoading(true)
    // setTimeout(() => {
    //   const dummyStudies = [
    //     {
    //       id: 1,
    //       title: "알고리즘 마스터하기",
    //       description: "코딩 테스트 대비 알고리즘 스터디입니다. 매주 문제를 풀고 함께 리뷰합니다.",
    //       category: "프로그래밍",
    //       location: "온라인",
    //       memberCount: 8,
    //       maxMembers: 10,
    //     },
    //     {
    //       id: 2,
    //       title: "토익 900점 도전",
    //       description: "토익 900점 이상을 목표로 하는 스터디입니다. 매일 단어 테스트와 주 2회 모의고사를 진행합니다.",
    //       category: "외국어",
    //       location: "오프라인",
    //       memberCount: 5,
    //       maxMembers: 8,
    //     },
    //     {
    //       id: 3,
    //       title: "정보처리기사 스터디",
    //       description: "정보처리기사 자격증 취득을 위한 스터디입니다. 이론 공부와 기출문제 풀이를 함께합니다.",
    //       category: "자격증",
    //       location: "온/오프라인 혼합",
    //       memberCount: 12,
    //       maxMembers: 15,
    //     },
    //     {
    //       id: 4,
    //       title: "프론트엔드 개발자 모임",
    //       description: "React, Vue 등 프론트엔드 기술을 공부하는 모임입니다. 실제 프로젝트를 함께 진행합니다.",
    //       category: "프로그래밍",
    //       location: "온라인",
    //       memberCount: 6,
    //       maxMembers: 8,
    //     },
    //     {
    //       id: 5,
    //       title: "영어 회화 스터디",
    //       description: "원어민과 함께하는 영어 회화 스터디입니다. 주 2회 오프라인 모임을 진행합니다.",
    //       category: "외국어",
    //       location: "오프라인",
    //       memberCount: 4,
    //       maxMembers: 6,
    //     },
    //     {
    //       id: 6,
    //       title: "독서 토론 모임",
    //       description: "매주 한 권의 책을 읽고 토론하는 모임입니다. 다양한 장르의 책을 함께 읽어요.",
    //       category: "독서",
    //       location: "온라인",
    //       memberCount: 7,
    //       maxMembers: 10,
    //     },
    //     {
    //       id: 7,
    //       title: "취업 준비 스터디",
    //       description: "IT 기업 취업을 위한 스터디입니다. 면접 준비와 포트폴리오 리뷰를 함께합니다.",
    //       category: "취업 준비",
    //       location: "온/오프라인 혼합",
    //       memberCount: 8,
    //       maxMembers: 12,
    //     },
    //     {
    //       id: 8,
    //       title: "파이썬 기초 스터디",
    //       description: "파이썬 기초부터 차근차근 배우는 스터디입니다. 초보자 환영합니다.",
    //       category: "프로그래밍",
    //       location: "온라인",
    //       memberCount: 10,
    //       maxMembers: 15,
    //     },
    //     {
    //       id: 9,
    //       title: "일본어 JLPT N2 준비",
    //       description: "JLPT N2 시험 준비를 위한 스터디입니다. 문법과 독해를 중점적으로 공부합니다.",
    //       category: "외국어",
    //       location: "온라인",
    //       memberCount: 6,
    //       maxMembers: 10,
    //     },
    //   ]

    //   // 필터링 적용
    //   let filteredStudies = dummyStudies

    //   // 카테고리 필터링
    //   if (selectedCategory !== "전체") {
    //     filteredStudies = filteredStudies.filter((study) => study.category === selectedCategory)
    //   }

    //   // 검색어 필터링
    //   if (searchTerm) {
    //     filteredStudies = filteredStudies.filter(
    //       (study) =>
    //         study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //         study.description.toLowerCase().includes(searchTerm.toLowerCase()),
    //     )
    //   }

    //   setStudies(filteredStudies)
    //   setLoading(false)
    // }, 500)
  }, [selectedCategory, searchTerm])

  // 검색 핸들러
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 검색 로직은 useEffect에서 처리됨
  }

  // 카테고리 필터 핸들러
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">스터디 목록</h1>
        <p className="text-gray-600">다양한 분야의 스터디를 찾아보세요</p>
      </div>

      {/* 검색 */}
      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="스터디 검색..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </form>
        <Button asChild>
          <Link href="/create">스터디 만들기</Link>
        </Button>
      </div>

      {/* 카테고리 필터 */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">카테고리</h3>
          <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full">
            <TabsList className="w-full h-auto flex flex-wrap gap-2 justify-start bg-transparent">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 스터디 목록 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-[250px] animate-pulse">
              <CardContent className="p-6">
                <div className="h-full bg-gray-200 rounded-md"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : studies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studies.map((study) => (
            <Link href={`/studies/${study.id}`} key={study.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{study.title}</CardTitle>
                    <Badge variant="outline">{study.category}</Badge>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">{study.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{study.location}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {study.memberCount}/{study.maxMembers}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    자세히 보기
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">검색 결과가 없습니다.</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("전체")
            }}
          >
            필터 초기화
          </Button>
        </div>
      )}
    </div>
  )
}
