"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { ArrowLeft, Users, MapPin, Calendar, MessageSquare } from "../components/icons/Icons"
import { useAuth } from "../contexts/AuthContext"
import { useChat } from "../contexts/ChatContext"

// Mock data for a single study group
const getStudyGroup = (id) => {
  return {
    id: Number.parseInt(id),
    title: "알고리즘 스터디",
    category: "프로그래밍",
    description:
      "코딩 테스트 대비 알고리즘 문제 풀이 스터디입니다. 주 2회 온라인으로 진행됩니다. 프로그래밍 언어는 Python 또는 Java를 사용합니다. 알고리즘 기초 지식이 있으신 분들을 대상으로 합니다. 매주 월요일과 목요일 저녁 8시에 코딩 테스트 대비 알고리즘 문제 풀이 스터디입니다. 주 2회 온라인으로 진행됩니다. 프로그래밍 언어는 Python 또는 Java를 사용합니다. 알고리즘 기초 지식이 있으신 분들을 대상으로 합니다. 매주 월요일과 목요일 저녁 8시에 온라인으로 만나 함께 문제를 풀고 코드 리뷰를 진행합니다. 스터디 기간은 3개월을 예상하고 있습니다.",
    maxParticipants: 6,
    currentParticipants: 3,
    location: "온라인",
    createdAt: "2024-04-15",
    schedule: "매주 월, 목 저녁 8시",
    duration: "3개월",
    leader: {
      id: 2,
      name: "김코딩",
      avatar: "KC",
    },
    members: [
      { id: 3, name: "이자바", avatar: "LJ" },
      { id: 4, name: "박파이썬", avatar: "PP" },
    ],
  }
}

function StudyGroupDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { createDirectChat } = useChat()
  const studyGroup = getStudyGroup(id)
  const [joined, setJoined] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleJoin = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }

    setJoined(true)
    // Here you would typically send a request to your backend
    alert("스터디에 참여 신청되었습니다!")
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
                      {studyGroup.leader.avatar}
                    </div>
                    <div>
                      <p className="font-medium">{studyGroup.leader.name}</p>
                      <p className="text-xs text-gray-500">스터디장</p>
                    </div>
                  </div>
                  {studyGroup.members.map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-medium">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
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
                >
                  <Users className="h-4 w-4" />
                  스터디 참여하기
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
