"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MapPin, Share2, MessageCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import ChatComponent from "@/components/chat"
import { useAuth } from "@/components/auth-provider"
import axios, { AxiosResponse, AxiosError } from "axios"; // Import axios types

// 스터디 타입 정의
interface Study {
  id: number
  title: string
  description: string
  category: string
  location: string
  memberCount: number
  maxMembers: number
  members: Member[]
  isJoined: boolean
}

// 멤버 타입 정의
interface Member {
  id: number
  name: string
  role: string
  avatar: string
}

export default function StudyDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [study, setStudy] = useState<Study | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  // 스터디 정보 가져오기 (실제로는 API 호출)
  useEffect(() => {
    axios.get(`/api/studies/${params.id}`)
      .then((response: AxiosResponse<Study>) => {
        setStudy(response.data);
        setLoading(false);
      })
      .catch((error: unknown) => {
        console.error('스터디 정보를 불러오는데 실패했습니다:', error);
        if (axios.isAxiosError(error)) {
          // Axios 에러 처리
        } else {
          // 기타 에러 처리
        }
        setLoading(false);
        router.push('/studies');
      });
  }, [params.id, router])

  // 스터디 참여 핸들러
  const handleJoin = async () => {
    if (!study) return

    // 로그인 확인
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "스터디에 참여하려면 먼저 로그인해주세요.",
        variant: "destructive",
      })
      return
    }

    setJoining(true)
    try {
      await axios.post(`/api/studies/${study.id}/join`);

      // 상태 업데이트
      setStudy({
        ...study,
        isJoined: true,
        memberCount: study.memberCount + 1,
      })

      toast({
        title: "스터디 참여 완료",
        description: "성공적으로 스터디에 참여했습니다.",
      })
    } catch (error: unknown) {
      console.error("스터디 참여 중 오류 발생:", error)
      let errorMessage = "스터디 참여 중 오류가 발생했습니다.";
      if (axios.isAxiosError(error)) {
         errorMessage = error.response?.data?.message || error.message || errorMessage;
      } else if (error instanceof Error) {
         errorMessage = error.message;
      }
      toast({
        title: "오류 발생",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setJoining(false)
    }
  }

  // 공유 핸들러
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: study?.title,
          text: study?.description,
          url: window.location.href,
        })
        .catch((error) => console.error("공유 중 오류 발생:", error))
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "링크 복사 완료",
        description: "스터디 링크가 클립보드에 복사되었습니다.",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-[300px]"></div>
          <div className="h-4 bg-gray-200 rounded w-[250px]"></div>
          <div className="h-64 bg-gray-200 rounded w-full max-w-3xl"></div>
        </div>
      </div>
    )
  }

  if (!study) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">스터디를 찾을 수 없습니다</h1>
        <Button onClick={() => router.push("/studies")}>스터디 목록으로</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{study.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{study.category}</Badge>
            <span className="text-sm text-gray-500">
              멤버: {study.memberCount}/{study.maxMembers}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          {!study.isJoined && study.memberCount < study.maxMembers && (
            <Button onClick={handleJoin} disabled={joining}>
              {joining ? "참여 중..." : "스터디 참여하기"}
            </Button>
          )}
          {study.isJoined && (
            <Button variant="outline" disabled>
              참여 중
            </Button>
          )}
          {!study.isJoined && study.memberCount >= study.maxMembers && (
            <Button variant="outline" disabled>
              모집 마감
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info">스터디 정보</TabsTrigger>
          <TabsTrigger value="members">멤버 ({study.members.length})</TabsTrigger>
          {study.isJoined && <TabsTrigger value="chat">채팅</TabsTrigger>}
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>스터디 소개</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="whitespace-pre-line">{study.description}</div>
                </div>

                <div className="grid grid-cols-1 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">스터디 장소</div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{study.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>스터디 멤버</CardTitle>
              <CardDescription>
                현재 {study.memberCount}명이 참여 중입니다 (최대 {study.maxMembers}명)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {study.members.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted">
                    <Avatar>
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {study.isJoined && (
          <TabsContent value="chat" className="h-[600px]">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  스터디 채팅
                </CardTitle>
                <CardDescription>스터디 멤버들과 실시간으로 대화하세요</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ChatComponent studyId={study.id} studyTitle={study.title} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
