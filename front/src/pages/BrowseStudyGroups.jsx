import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import StudyCard from "../components/StudyCard"

// Mock data for study groups
const studyGroups = [
  {
    id: 1,
    title: "알고리즘 스터디",
    category: "프로그래밍",
    description: "코딩 테스트 대비 알고리즘 문제 풀이 스터디입니다. 주 2회 온라인으로 진행됩니다.",
    maxParticipants: 6,
    currentParticipants: 3,
    location: "온라인",
    createdAt: "2024-04-15",
  },
  {
    id: 2,
    title: "토익 900점 목표 스터디",
    category: "외국어",
    description: "토익 900점 이상을 목표로 하는 스터디입니다. 매주 토요일 오프라인으로 만나 공부합니다.",
    maxParticipants: 5,
    currentParticipants: 4,
    location: "오프라인",
    createdAt: "2024-04-16",
  },
  {
    id: 3,
    title: "취업 면접 대비 스터디",
    category: "취업 준비",
    description: "IT 기업 면접 준비를 위한 스터디입니다. 모의 면접과 피드백을 주고받습니다.",
    maxParticipants: 8,
    currentParticipants: 5,
    location: "온/오프라인 혼합",
    createdAt: "2024-04-17",
  },
  {
    id: 4,
    title: "정보처리기사 자격증 스터디",
    category: "자격증",
    description: "정보처리기사 자격증 취득을 위한 스터디입니다. 함께 문제를 풀고 공부합니다.",
    maxParticipants: 10,
    currentParticipants: 7,
    location: "온라인",
    createdAt: "2024-04-18",
  },
  {
    id: 5,
    title: "월간 독서 모임",
    category: "독서",
    description: "매달 한 권의 책을 선정하여 읽고 토론하는 독서 모임입니다.",
    maxParticipants: 12,
    currentParticipants: 8,
    location: "오프라인",
    createdAt: "2024-04-19",
  },
  {
    id: 6,
    title: "주식 투자 스터디",
    category: "기타",
    description: "주식 투자에 관심 있는 분들과 함께 공부하고 정보를 공유하는 스터디입니다.",
    maxParticipants: 7,
    currentParticipants: 4,
    location: "온라인",
    createdAt: "2024-04-20",
  },
]

function BrowseStudyGroups() {
  return (
    <Layout>
      <div className="py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">스터디 찾기</h1>
              <p className="mt-2 text-gray-500">현재 모집 중인 스터디 그룹을 찾아보세요.</p>
            </div>
            <Link to="/create" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all">
              새 스터디 만들기
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {studyGroups.map((group) => (
              <StudyCard key={group.id} study={group} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BrowseStudyGroups
