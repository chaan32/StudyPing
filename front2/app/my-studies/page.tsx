"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageCircle } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ChatComponent from "@/components/chat"
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
  role: string // 사용자의 역할 (운영자/멤버)
}

export default function MyStudiesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)

  // 채팅 관련 상태
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null)

  // 로그인 상태 확인
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  // 내 스터디 목록 가져오기 (실제로는 API 호출)
  useEffect(() => {
    if (!user) return

    // 실제 구현에서는 axios를 사용하여 백엔드에서 데이터를 가져옵니다
    axios.get('/api/my-studies')
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
    //   // 참여 중인 스터디
    //   const participatingStudies = [
    //     {
    //       id: 1,
    //       title: "알고리즘 마스터하기",
    //       description: "코딩 테스트 대비 알고리즘 스터디입니다. 매주 문제를 풀고 함께 리뷰합니다.",
    //       category: "프로그래밍",
    //       location: "온라인",
    //       memberCount: 8,
    //       maxMembers: 10,
    //       role: "멤버",
    //     },
    //     {
    //       id: 3,
    //       title: "정보처리기사 스터디",
    //       description: "정보처리기사 자격증 취득을 위한 스터디입니다. 이론 공부와 기출문제 풀이를 함께합니다.",
    //       category: "자격증",
    //       location: "온/오프라인 혼합",
    //       memberCount: 12,
    //       maxMembers: 15,
    //       role: "운영자",
    //     },
    //     {
    //       id: 7,
    //       title: "취업 준비 스터디",
    //       description: "IT 기업 취업을 위한 스터디입니다. 면접 준비와 포트폴리오 리뷰를 함께합니다.",
    //       category: "취업 준비",
    //       location: "온/오프라인 혼합",
    //       memberCount: 8,
    //       maxMembers: 12,
    //       role: "운영자",
    //     },
    //   ]

    //   setStudies(participatingStudies)
    //   setLoading(false)
    // }, 500)
  }, [user])

  // 채팅방 열기 핸들러
  const openChat = (study: Study) => {
    setSelectedStudy(study)
    setChatOpen(true)
  }

  // 로딩 중이거나 로그인되지 않은 경우
  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-[300px]"></div>
          <div className="h-4 bg-gray-200 rounded w-[250px]"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">내 스터디</h1>
        <p className="text-gray-600">참여 중인 스터디를 확인하세요</p>
      </div>

      {/* 스터디 목록 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
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
            <Card key={study.id} className="hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{study.title}</CardTitle>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="outline">{study.category}</Badge>
                    <Badge variant="outline" className="bg-primary/10">
                      {study.role}
                    </Badge>
                  </div>
                </div>
                <CardDescription className="line-clamp-2 mt-2">{study.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {study.memberCount}/{study.maxMembers}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openChat(study)}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    채팅
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/studies/${study.id}`}>자세히 보기</Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">참여 중인 스터디가 없습니다.</p>
          <Button asChild>
            <Link href="/studies">스터디 찾아보기</Link>
          </Button>
        </div>
      )}

      {/* 채팅 다이얼로그 */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="sm:max-w-[500px] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedStudy?.title} 채팅방</DialogTitle>
            <DialogDescription>스터디 멤버들과 실시간으로 대화하세요</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedStudy && <ChatComponent studyId={selectedStudy.id} studyTitle={selectedStudy.title} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
