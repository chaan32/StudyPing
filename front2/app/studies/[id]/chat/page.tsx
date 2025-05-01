"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import ChatComponent from "@/components/chat"
import { useAuth } from "@/components/auth-provider"
import axios, { AxiosResponse, AxiosError } from "axios"

// 스터디 타입 정의
interface Study {
  id: number
  title: string
  isJoined: boolean
}

export default function StudyChatPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [study, setStudy] = useState<Study | null>(null)
  const [loading, setLoading] = useState(true)

  // 스터디 정보 가져오기 (실제로는 API 호출)
  useEffect(() => {
    if (params.id) {
      axios
        .get(`/api/studies/${params.id}`)
        .then((response: AxiosResponse<Study>) => {
          setStudy(response.data);
          setLoading(false);
        })
        .catch((error: unknown) => {
          console.error('스터디 정보를 불러오는데 실패했습니다:', error);
          if (axios.isAxiosError(error)) {
            console.error('Axios Error:', error.message);
          } else {
            console.error('Unknown Error:', error);
          }
          setLoading(false);
          router.push('/studies');
        });
    }

    // 백엔드 연결 전 더미 데이터
    // setTimeout(() => {
    //   setStudy({
    //     id: Number.parseInt(params.id),
    //     title: "알고리즘 마스터하기",
    //     isJoined: user ? true : false, // 로그인 상태에 따라 참여 여부 설정
    //   })
    //   setLoading(false)
    // }, 500)
  }, [params.id, router, user])

  // 로그인 및 참여 여부 확인
  useEffect(() => {
    if (!loading && study) {
      if (!user) {
        router.push(`/studies/${params.id}`)
      } else if (!study.isJoined) {
        router.push(`/studies/${params.id}`)
      }
    }
  }, [loading, study, user, router, params.id])

  if (loading || !study || !user) {
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
    <div className="h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{study.title} 채팅방</h1>
      </div>

      <div className="flex-1 overflow-hidden border rounded-lg">
        <ChatComponent studyId={study.id} studyTitle={study.title} />
      </div>
    </div>
  )
}
