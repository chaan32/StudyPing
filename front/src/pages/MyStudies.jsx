"use client"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import { useAuth } from "../contexts/AuthContext"
import { useChat } from "../contexts/ChatContext"
import { Calendar, MapPin, Users } from "../components/icons/Icons"
import axios from "axios"

function MyStudies() {
  const { isLoggedIn } = useAuth()
  const { openChat } = useChat()
  const [myStudies, setMyStudies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMyStudies = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken")
        const user = JSON.parse(localStorage.getItem("user"))
        if (!accessToken || !user) throw new Error("로그인이 필요합니다")

        const response = await axios.get(`/study/find/joined/${user.id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        })

        setMyStudies(response.data.studyList || [])
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMyStudies()
  }, [])

  const formatNextMeeting = (dateString) => {
    const date = new Date(dateString)
    const options = {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "long",
    }
    return date.toLocaleDateString("ko-KR", options)
  }

  const openGroupChat = (studyId) => {
    openChat(studyId, "group")
  }

  const openDirectChat = (leader) => {
    openChat(leader.id, "direct")
  }

  if (!isLoggedIn) {
    return (
        <Layout>
          <div className="py-12">
            <div className="container px-4 md:px-6">
              <div className="text-center py-12">
                <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
                <p className="text-gray-500 mb-6">내 스터디를 확인하려면 로그인해주세요.</p>
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all">
                  로그인하기
                </button>
              </div>
            </div>
          </div>
        </Layout>
    )
  }

  if (loading) {
    return (
        <Layout>
          <div className="text-center py-12">
            <p>스터디 정보를 불러오는 중입니다...</p>
          </div>
        </Layout>
    )
  }

  if (error) {
    return (
        <Layout>
          <div className="text-center py-12 text-red-500">
            <p>{error}</p>
          </div>
        </Layout>
    )
  }

  return (
      <Layout>
        <div className="py-12">
          <div className="container px-4 md:px-6">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl mb-6">내 스터디</h1>

            {myStudies.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold mb-2">참여 중인 스터디가 없습니다</h2>
                  <p className="text-gray-500 mb-6">새로운 스터디에 참여하거나 직접 스터디를 만들어보세요.</p>
                  <Link to="/browse" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all mr-4">
                    스터디 찾기
                  </Link>
                  <Link to="/create" className="px-4 py-2 border hover:bg-gray-50 rounded-md transition-all">
                    스터디 만들기
                  </Link>
                </div>
            ) : (
                <div className="space-y-6">
                  {myStudies.map((study) => (
                      <div key={study.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full border mb-2">
                          {study.category}
                        </span>
                              <h2 className="text-xl font-bold">{study.title}</h2>
                              <p className="text-sm text-gray-500 mt-1">역할  : <span className="font-medium">{study.role === 'Leader' ? 'Leader' : 'Member'}</span></p>
                            </div>
                            <Link to={`/study/${study.id}`} className="text-sm text-blue-500 hover:underline">
                              상세보기
                            </Link>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span>진행 방식: {study.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span>생성일: {new Date(study.createdAt).toLocaleDateString("ko-KR")}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => openGroupChat(study.id)}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
                            >
                              <Users className="h-4 w-4" />
                              그룹 채팅
                            </button>
                            <button
                                onClick={() => openDirectChat({ id: 0 })}
                                className="flex items-center justify-center gap-2 px-4 py-2 border hover:bg-gray-50 rounded-md transition-all"
                            >
                              스터디장에게 문의하기
                            </button>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      </Layout>
  )
}

export default MyStudies
