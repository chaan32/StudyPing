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
import { useAuth } from "@/components/auth-provider";

// 스터디 타입 정의 (백엔드 StudyResDto 기준)
interface Study {
  id: number;
  title: string;
  description: string;
  category: string;
  memberCount: number;
  maxMembers: number;
  createdAt?: string; // 필요시 추가
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

  useEffect(() => {
    setLoading(true);

    // API 엔드포인트 결정
    let apiUrl = '';
    if (selectedCategory === '전체') {
      apiUrl = 'http://localhost:8080/study/find/all';
    } else {
      let tempC = '';
      if (selectedCategory === '프로그래밍') tempC = 'PROGRAMMING';
      else if (selectedCategory === '외국어') tempC = 'LANGUAGE';
      else if (selectedCategory === '취업 준비') tempC = 'JOB';
      else if (selectedCategory === '자격증') tempC = 'CERTIFICATION';
      else if (selectedCategory === '독서') tempC = 'READING';
      else if (selectedCategory === '기타') tempC = 'ETC';
      apiUrl = `http://localhost:8080/study/find/category/${tempC}`;
    }

    const token = localStorage.getItem("accessToken");
    // 요청 보내기
    axios.get(apiUrl, {
      headers: {
        Authorization: `Bearer ${token}` // 헤더에 토큰 포함
      },
      withCredentials: true
    })
      .then((response: AxiosResponse<{ studies: Study[]; message: string }>) => {
        setStudies(response.data.studies || []);
        setLoading(false);
      })
      .catch((error: AxiosError) => {
        console.error("스터디 목록을 불러오는데 실패했습니다:", error);
        setLoading(false);
      });
  }, [selectedCategory, searchTerm])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // 검색 로직은 useEffect에서 처리됨
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const StudyCard = ({ study }: { study: Study }) => {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold mb-1">{study.title}</CardTitle>
            <Badge variant="secondary">{study.category}</Badge>
          </div>
          <CardDescription className="text-sm text-gray-600 h-10 overflow-hidden text-ellipsis">
            {study.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-gray-500 flex justify-between items-center">
            <span>멤버: {study.memberCount} / {study.maxMembers}</span>
            {study.createdAt && <span>개설: {new Date(study.createdAt).toLocaleDateString()}</span>}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">
            자세히 보기
          </Button>
        </CardFooter>
      </Card>
    )
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
              <StudyCard study={study} />
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
