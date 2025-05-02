"use client"

import type React from "react"
import axios, { AxiosResponse, AxiosError } from "axios"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

// 카테고리 목록
const categories = [
  { value: "PROGRAMMING", label: "프로그래밍" },
  { value: "LANGUAGE", label: "외국어" },
  { value: "JOB", label: "취업 준비" },
  { value: "CERTIFICATION", label: "자격증" },
  { value: "READING", label: "독서" },
  { value: "ETC", label: "기타" }
]

// 장소 타입 정의 추가
const locationTypes = [
  { value: "ONLINE", label: "온라인" },
  { value: "OFFLINE", label: "오프라인" },
  { value: "BOTH", label: "온/오프라인 혼합" },
]

interface Study {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  maxParticipants: number;
  makerId : number;
}

export default function CreateStudyPage() {
  const router = useRouter()
  const token = localStorage.getItem("accessToken");
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    maxParticipants: 10,
    makerId : Number(localStorage.getItem("userId"))
  })

  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 셀렉트 변경 핸들러
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    if (!formData.title || !formData.description || !formData.category || !formData.location) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // 실제 구현에서는 axios를 사용하여 백엔드로 데이터를 전송합니다
      axios.post('http://localhost:8080/study/create', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        withCredentials: true
      })


      toast({
        title: "스터디 생성 완료",
        description: "스터디가 성공적으로 생성되었습니다.",
      })

      // 스터디 목록 페이지로 이동
      router.push("/studies")
    } catch (error: unknown) {
      console.error("스터디 생성 중 오류 발생:", error)

      let errorMessage = "스터디 생성 중 오류가 발생했습니다. 다시 시도해주세요.";
      if (axios.isAxiosError(error)) {
        // Axios 에러인 경우 서버 응답 메시지 또는 기본 메시지 사용
        errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
        // 일반 Error 객체인 경우
        errorMessage = error.message;
      }

      toast({
        title: "오류 발생",
        description: `스터디 생성을 실패했습니다: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">새 스터디 만들기</h1>
        <p className="text-gray-600 mt-2">함께 공부할 멤버를 모집해보세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>스터디 정보</CardTitle>
          <CardDescription>스터디에 대한 기본 정보를 입력해주세요.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">스터디 제목 *</Label>
              <Input
                id="title"
                name="title"
                placeholder="스터디 제목을 입력하세요"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">스터디 설명 *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="스터디에 대한 설명을 입력하세요"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">카테고리 *</Label>
              <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">스터디 장소 *</Label>
              <Select value={formData.location} onValueChange={(value) => handleSelectChange("location", value)}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="장소 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map((locationType) => (
                    <SelectItem key={locationType.value} value={locationType.value}>
                      {locationType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMembers">최대 인원 *</Label>
              <Input
                id="maxMembers"
                name="maxMembers"
                type="number"
                min={2}
                max={50}
                value={formData.maxParticipants}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              취소
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "생성 중..." : "스터디 생성하기"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
