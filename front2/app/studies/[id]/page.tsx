"use client"

import { useEffect, useState, use } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MapPin, Share2, MessageCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import axios, { AxiosResponse, AxiosError } from "axios"; 
import Link from 'next/link';

// 스터디 타입 정의 (백엔드 DTO 기준)
interface Study {
  id: number;
  title: string;
  description: string;
  category: string;
  // memberCount: number;
  // maxMembers: number;
  currentParticipants: number; // 필드명 수정
  maxParticipants: number; // 필드명 수정
  members: Member[];
  createdAt?: string; // 생성일 추가 (백엔드에서 제공한다면)
}

// 멤버 타입 정의 (백엔드 DTO 기준)
interface Member {
  id: number;
  name: string;
}

export default function StudyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const actualParams = use(params); // use 훅으로 params 언래핑
  const studyId = actualParams.id; // 언래핑된 객체에서 id 추출

  const { user } = useAuth();
  const [study, setStudy] = useState<Study | null>(null);
  const [isJoined, setIsJoined] = useState(false); // 참여 상태 관리
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // 스터디 정보 가져오기
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    axios.get(`http://localhost:8080/study/find/id/${studyId}`,{
      headers: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true
    }) // API 엔드포인트 수정
      .then((response: AxiosResponse<{ study: Study; message: string }>) => { // 응답 구조 반영
        const fetchedStudy = response.data.study;
        setStudy(fetchedStudy);

        // 참여 여부 확인 (로그인 상태이고 멤버 목록에 포함되어 있는지)
        if (localStorage.getItem("isLoggedIn") === "true") {
          setIsJoined(true);
        } else {
          setIsJoined(false);
        }

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
  }, [studyId, user, router]) // 의존성 배열에 studyId 와 user 추가 (user는 참여여부 확인에 사용)

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

    // localStorage는 클라이언트 측에서만 접근 가능하므로 핸들러 함수 내부에서 호출
    const token = localStorage.getItem("accessToken");
    if (!token) { // 토큰 존재 여부도 확인하는 것이 좋음
      toast({
        title: "인증 오류",
        description: "로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.",
        variant: "destructive",
      });
      // 필요한 경우 로그인 페이지로 리디렉션
      // router.push('/login');
      return;
    }

    setJoining(true)
    try {
      // API 엔드포인트 및 파라미터 수정
      await axios
      .post(`http://localhost:8080/study/join/${user.id}/${studyId}`,null,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // 참여 상태 및 멤버 수 즉시 반영 (Refetch 대신)
      setIsJoined(true);
      setStudy(prevStudy => prevStudy ? {
        ...prevStudy,
        currentParticipants: prevStudy.currentParticipants + 1,
      } : null);

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

  console.log('Rendering buttons check:', {
    isJoined,
    currentParticipants: study?.currentParticipants,
    maxParticipants: study?.maxParticipants,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">{study.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{study.category}</Badge>
            <span className="text-sm text-gray-500">
              멤버: {study.currentParticipants}/{study.maxParticipants}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          {/* 조건부 렌더링 시작 */}
          {!isJoined && study.currentParticipants < study.maxParticipants && (
            <Button onClick={handleJoin} disabled={joining}>
              {joining ? "참여 중..." : "스터디 참여하기"}
            </Button>
          )}
          {isJoined && (
            <Button variant="outline" disabled>
              참여 중
            </Button>
          )}
          {!isJoined && study.currentParticipants >= study.maxParticipants && (
            <Button variant="outline" disabled>
              모집 마감
            </Button>
          )}
          {/* 조건부 렌더링 끝 */}
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info">스터디 정보</TabsTrigger>
          <TabsTrigger value="members">멤버 ({study.members.length})</TabsTrigger>
          {isJoined ? (
            <Link href={`/studies/${study.id}/chat`} passHref legacyBehavior>
              <Button variant="ghost" className="w-full justify-center data-[state=active]:bg-muted data-[state=active]:text-foreground">
                채팅
              </Button>
            </Link>
          ) : (
            <Button variant="ghost" className="w-full" disabled>채팅 (참여 후 이용 가능)</Button>
          )}
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
                    <div className="text-sm font-medium">스터디 정보</div>
                    <div className="flex items-center gap-2">
                      {study.createdAt && (
                        <span className="mr-4">개설일: {new Date(study.createdAt).toLocaleDateString()}</span>
                      )}
                      <span className="mr-4">멤버: {study.currentParticipants} / {study.maxParticipants}</span>
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
                현재 {study.currentParticipants}명이 참여 중입니다 (최대 {study.maxParticipants}명)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {study.members?.map((member) => (
                  <li key={member.id ?? Math.random()} className="flex items-center gap-2">
                    <Avatar>
                      <AvatarFallback>{member.name ? member.name.slice(0, 1).toUpperCase() : '?'}</AvatarFallback>
                    </Avatar>
                    <span>{member.name ?? 'Unknown Member'}</span> 
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
