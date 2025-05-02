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

// 스터디 타입 정의 (백엔드 API 응답 기준 - StudyResDto 가정)
interface Study {
  id: number
  title: string
  description: string
  category: string
  currentParticipants: number // 필드 이름 수정 (API 응답 기준)
  maxParticipants: number // 필드 이름 수정
  createdAt?: string // 생성 날짜 (선택적)
  location?: string // 필요 시 추가
  role?: string // 필요 시 추가
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
    const token = localStorage.getItem('accessToken');
    const userId = localStorage.getItem('userId');

    if (!user) return


    // 실제 구현에서는 axios를 사용하여 백엔드에서 데이터를 가져옵니다
    axios.get(`http://localhost:8080/study/find/joined/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}` // 헤더는 인터셉터가 처리할 것으로 가정 (필요 시 주석 해제)
      },
      withCredentials: true
    })
      .then((response: AxiosResponse<{ studyList: Study[] }>) => {
        // studyList 키가 없을 경우를 대비하여 확인 후 추출 (백엔드 응답이 배열만 올 수도 있으므로)
        const studiesData = response.data.studyList || response.data || []; 
        console.log('API 응답 데이터 (raw):', response.data);
        console.log('추출된 스터디 데이터:', studiesData);
        setStudies(studiesData);
        setLoading(false);
      })
      .catch((error: AxiosError) => {
        console.error('스터디 목록을 불러오는데 실패했습니다:', error);
        setLoading(false);
      });
  }, [user])

  // studies 상태 변화 확인
  useEffect(() => {
    console.log('Studies 상태 업데이트됨:', studies);
  }, [studies]);

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
              {/* 3. 맵핑 함수 내부 로그 (필요 시) */}
              {/* {console.log('Rendering study:', study)} */}
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-xl">{study.title}</CardTitle>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="secondary">{study.category}</Badge> {/* 스타일 통일 */}
                  </div>
                </div>
                <CardDescription className="line-clamp-2 mt-2">{study.description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-500">
                    {study.currentParticipants}/{study.maxParticipants} {/* 필드 이름 수정 */}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openChat(study)}>
                    <MessageCircle className="h-4 w-4 mr-1" />
                    채팅
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/studies/${study.id}`} passHref>자세히 보기</Link>
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
