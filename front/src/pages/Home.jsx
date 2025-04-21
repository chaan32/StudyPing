import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import { BookOpen, Users, Calendar, ArrowRight } from "../components/icons/Icons"

function Home() {
  return (
    <Layout>
      <section className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                함께 성장하는 스터디 그룹을 찾아보세요
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                관심 있는 주제의 스터디에 참여하거나 직접 스터디를 만들어 함께 공부할 멤버를 모집해보세요.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/browse"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md transition-all"
              >
                스터디 찾기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                to="/create"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 hover:bg-gray-50 font-medium rounded-md transition-all"
              >
                스터디 만들기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 md:gap-10">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tighter md:text-3xl">인기 스터디 카테고리</h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg">
                다양한 분야의 스터디 그룹에 참여하여 함께 성장하세요.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              {[
                { title: "프로그래밍", icon: <BookOpen className="h-10 w-10" />, color: "bg-blue-100" },
                { title: "외국어", icon: <Users className="h-10 w-10" />, color: "bg-green-100" },
                { title: "취업 준비", icon: <Calendar className="h-10 w-10" />, color: "bg-yellow-100" },
                { title: "자격증", icon: <BookOpen className="h-10 w-10" />, color: "bg-purple-100" },
                { title: "독서", icon: <Users className="h-10 w-10" />, color: "bg-pink-100" },
                { title: "기타", icon: <Calendar className="h-10 w-10" />, color: "bg-gray-100" },
              ].map((category, index) => (
                <Link
                  key={index}
                  to={`/browse?category=${category.title}`}
                  className="flex flex-col items-center p-4 md:p-6 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <div className={`p-3 rounded-full ${category.color} mb-4`}>{category.icon}</div>
                  <h3 className="text-lg font-medium">{category.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Home
