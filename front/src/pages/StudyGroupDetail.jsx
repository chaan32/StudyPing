"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { ArrowLeft, Users, MapPin, Calendar, MessageSquare } from "../components/icons/Icons"
import { useAuth } from "../contexts/AuthContext"
import { useChat } from "../contexts/ChatContext"
import axios from "axios";

function StudyGroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()
  const { createDirectChat } = useChat()
  const [studyGroup, setStudyGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [joined, setJoined] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [joinLoading, setJoinLoading] = useState(false)

  useEffect(() => {
    const fetchStudyGroup = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const { data } = await axios.get(`/study/find/id/${id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
  
        // ✅ 여기 수정
        setStudyGroup(data.study); 
        
      } catch (err) {
        const serverMessage = err.response?.data?.message;
        const errorMessage = serverMessage || err.message;
        setError(`서버 오류: ${errorMessage}`);
        
        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
  
    if (id) fetchStudyGroup().then(r => {});
  }, [id]);

  if (loading) return <Layout>Loading...</Layout>
  if (error) return <Layout>{error}</Layout>

  const handleJoin = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
  
    if (!user || !user.id) {
      alert("로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.");
      navigate('/login');
      return;
    }
  
    setJoinLoading(true)
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await axios.post(`/study/join/${user.id}/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      
      if (response.data.success) {
        setJoined(true)
        alert("스터디에 참여 신청되었습니다!")
        // 페이지 새로고침으로 최신 정보 업데이트
        window.location.reload()
      } else {
        alert(response.data.message || "참여 신청에 실패했습니다.");
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message;
      const errorMessage = serverMessage || err.message;
      alert(`참여 신청 실패: ${errorMessage}`);
      
      if (err.response?.status === 401) {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    } finally {
      setJoinLoading(false);
    }
  }

  const handleInquiry = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }

    // 스터디장과의 1:1 채팅 열기
    createDirectChat(studyGroup.leader.id, studyGroup.leader.name, studyGroup.leader.avatar)
  }

  return (
    <Layout>
      <div className="py-12">
        <div className="container max-w-4xl px-4 md:px-6">
          <button
            onClick={() => navigate("/browse")}
            className="flex items-center text-gray-600 mb-6 hover:text-gray-800 transition-all"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            스터디 목록으로
          </button>

          <div className="border rounded-lg shadow-sm bg-white">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full border mb-2">
                  {studyGroup.category}
                </span>
                <div className="flex gap-2">
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100">
                    {studyGroup.currentParticipants}/{studyGroup.maxParticipants}명
                  </span>
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-50 border border-green-200">
                    모집중
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-bold">{studyGroup.title}</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>진행 방식: {studyGroup.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>생성일: {studyGroup.createdAt}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>일정: {studyGroup.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>예상 기간: {studyGroup.duration}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">스터디 소개</h3>
                <p className="text-gray-700 whitespace-pre-line">{studyGroup.description}</p>
              </div>

              <div>
                <h3 className="font-medium mb-3">스터디 멤버</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-medium">
                      {studyGroup.makerName[0]}
                    </div>
                    <div>
                      <p className="font-medium">{studyGroup.makerName}</p>
                      <p className="text-xs text-gray-500">스터디장</p>
                    </div>
                  </div>

                  {studyGroup.members && studyGroup.members.map((memberName, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-medium">
                        {memberName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{memberName}</p>
                        <p className="text-xs text-gray-500">멤버</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t flex flex-col sm:flex-row gap-3">
              {!joined ? (
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md w-full transition-all"
                  onClick={handleJoin}
                  disabled={joinLoading}
                >
                  {joinLoading ? (
                    "처리 중..."
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      스터디 참여하기
                    </>
                  )}
                </button>
              ) : (
                <button
                  className="flex items-center justify-center gap-2 px-4 py-2 border text-gray-500 rounded-md w-full"
                  disabled
                >
                  참여 신청됨
                </button>
              )}
              <button
                className="flex items-center justify-center gap-2 px-4 py-2 border hover:bg-gray-50 rounded-md w-full transition-all"
                onClick={handleInquiry}
              >
                <MessageSquare className="h-4 w-4" />
                문의하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default StudyGroupDetail
