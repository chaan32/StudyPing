"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { ArrowLeft } from "../components/icons/Icons"

function CreateStudyGroup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    maxParticipants: "",
    location: "",
    description: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData)

    // For now, we'll just show an alert and redirect
    alert("스터디 그룹이 성공적으로 생성되었습니다!")
    navigate("/browse")
  }

  return (
    <Layout>
      <div className="py-12">
        <div className="container max-w-3xl px-4 md:px-6">
          <div className="mb-8">
            <button
              onClick={() => navigate("/")}
              className="flex items-center text-gray-600 mb-4 hover:text-gray-800 transition-all"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              돌아가기
            </button>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">새 스터디 그룹 만들기</h1>
            <p className="mt-2 text-gray-500">함께 공부할 멤버를 모집해보세요.</p>
          </div>

          <div className="border rounded-lg shadow-sm bg-white">
            <form onSubmit={handleSubmit}>
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">스터디 정보</h2>
                <p className="text-sm text-gray-500">스터디에 대한 기본 정보를 입력해주세요.</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-medium">
                    스터디 제목
                  </label>
                  <input
                    id="title"
                    name="title"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="예: 토익 900점 목표 스터디"
                    required
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="block text-sm font-medium">
                    카테고리
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">카테고리 선택</option>
                    <option value="programming">프로그래밍</option>
                    <option value="language">외국어</option>
                    <option value="job">취업 준비</option>
                    <option value="certificate">자격증</option>
                    <option value="reading">독서</option>
                    <option value="other">기타</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="maxParticipants" className="block text-sm font-medium">
                      최대 인원
                    </label>
                    <input
                      id="maxParticipants"
                      name="maxParticipants"
                      type="number"
                      min="2"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="예: 5"
                      required
                      value={formData.maxParticipants}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="location" className="block text-sm font-medium">
                      진행 방식
                    </label>
                    <select
                      id="location"
                      name="location"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    >
                      <option value="">진행 방식 선택</option>
                      <option value="online">온라인</option>
                      <option value="offline">오프라인</option>
                      <option value="hybrid">온/오프라인 혼합</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium">
                    스터디 소개
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="스터디 목표, 진행 방식, 모집 대상 등을 자세히 적어주세요."
                    rows={5}
                    required
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="p-6 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
                >
                  스터디 만들기
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default CreateStudyGroup
