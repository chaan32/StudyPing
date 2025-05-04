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
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    maxParticipants: 2, // Default to 2
    makerId : Number(localStorage.getItem("userId"))
  })

  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    // Handle number input specifically
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === 'number' ? parseInt(value, 10) || 0 : value,
    }));
  }

  // 셀렉트 변경 핸들러
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Retrieve token right before submitting
    const token = localStorage.getItem("accessToken");
    const userId = localStorage.getItem("userId"); // Also get userId here if needed elsewhere

    // Validate token existence
    if (!token) {
      toast({
        title: "인증 오류",
        description: "로그인이 필요합니다. 로그인 후 다시 시도해주세요.",
        variant: "destructive",
      });
      setLoading(false); // Ensure loading is stopped
      return;
    }

    // Update formData with the latest userId just before submit
    const updatedFormData = {
        ...formData,
        makerId: Number(userId) // Ensure makerId uses the latest userId
    };

    // 유효성 검사 (maxParticipants 추가)
    if (!updatedFormData.title || !updatedFormData.description || !updatedFormData.category || !updatedFormData.location || !updatedFormData.maxParticipants || updatedFormData.maxParticipants < 2) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 올바르게 입력해주세요. (최소 인원 2명)",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Log the token and formData before sending the request
      console.log("Submitting study creation with:");
      console.log("Token:", token); // Log the token fetched inside handleSubmit
      console.log("FormData:", updatedFormData); // Log the updated form data

      // 실제 구현에서는 axios를 사용하여 백엔드로 데이터를 전송합니다
      axios.post('http://localhost:8080/study/create', updatedFormData, { // Use updatedFormData
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
              <Label htmlFor="maxParticipants">최대 인원 * (최소 2명)</Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min="2"
                placeholder="스터디 최대 인원 수를 입력하세요"
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
