"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Code, GraduationCap, Languages, Lightbulb, Users } from "lucide-react"

// 인기 카테고리 데이터
const popularCategories = [
  { id: 1, name: "프로그래밍", icon: <Code className="h-6 w-6" />, count: 42 },
  { id: 2, name: "외국어", icon: <Languages className="h-6 w-6" />, count: 28 },
  { id: 3, name: "취업 준비", icon: <Lightbulb className="h-6 w-6" />, count: 23 },
  { id: 4, name: "자격증", icon: <GraduationCap className="h-6 w-6" />, count: 35 },
  { id: 5, name: "독서", icon: <BookOpen className="h-6 w-6" />, count: 19 },
  { id: 6, name: "기타", icon: <Users className="h-6 w-6" />, count: 15 },
]

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* 히어로 섹션 */}
      <section className="py-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">함께 성장하는 스터디 모임, StudyPing</h1>
          <p className="text-xl text-gray-600 mb-8">
            관심 있는 분야의 스터디를 찾거나 직접 만들어 함께 성장하세요. StudyPing은 여러분의 학습 여정을 더 즐겁고
            효과적으로 만들어 드립니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/studies">스터디 찾기</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/create">스터디 만들기</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 인기 카테고리 섹션 */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">인기 카테고리</h2>
          <p className="text-gray-600 mt-2">다양한 분야의 스터디를 찾아보세요</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularCategories.map((category) => (
            <Link href={`/studies?category=${category.name}`} key={category.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="bg-primary/10 p-3 rounded-full mb-4">{category.icon}</div>
                  <h3 className="font-bold text-xl mb-2">{category.name}</h3>
                  <p className="text-gray-500">{category.count}개의 스터디</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 소개 섹션 */}
      <section className="bg-gray-50 p-8 rounded-lg">
        <div className="max-w-3xl mx-auto text-center">
          <BookOpen className="h-12 w-12 mx-auto text-primary mb-4" />
          <h2 className="text-3xl font-bold mb-4">StudyPing이란?</h2>
          <p className="text-lg text-gray-600 mb-6">
            StudyPing은 같은 목표를 가진 사람들이 함께 공부할 수 있는 스터디 모임 플랫폼입니다. 프로그래밍, 언어, 자격증
            등 다양한 분야의 스터디를 찾거나 직접 만들 수 있습니다. 실시간 채팅을 통해 멤버들과 소통하고, 함께 성장해
            나가세요.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/about">더 알아보기</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
