import { Link, useSearchParams, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import StudyCard from "../components/StudyCard";
import { useState, useEffect } from "react";
import axios from "axios";

// 카테고리 변환 매핑 (한글 -> 영문 대문자)
const categoryMapping = {
  "전체": "ALL",
  "프로그래밍": "PROGRAMMING",
  "외국어": "LANGUAGE",
  "취업 준비": "JOB",
  "자격증": "CERTIFICATE",
  "독서": "READING",
  "기타": "ETC"
};

// 인기 카테고리 목록 (한글)
const popularCategories = Object.keys(categoryMapping);

function BrowseStudyGroups() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryParam = searchParams.get('category') || '전체';
  
  // URL에서 가져온 카테고리를 기본값으로 설정
  const [studyGroups, setStudyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true);
        // 로컬 스토리지에서 accessToken 가져오기
        const accessToken = localStorage.getItem('accessToken');
        
        // accessToken이 없으면 요청을 보내지 않음
        if (!accessToken) {
          setError('로그인이 필요한 서비스입니다. 로그인 후 이용해 주세요.');
          setLoading(false);
          return;
        }
        
        // 카테고리에 따른 엔드포인트 선택 및 한글 카테고리를 영문 대문자로 변환
        const categoryForBackend = categoryMapping[selectedCategory] || selectedCategory;
        const endpoint = selectedCategory === "전체" 
          ? "/study/find/all" 
          : `/study/find/category/${categoryForBackend}`;

        // accessToken이 있을 때만 요청 전송
        const response = await axios.get(endpoint, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          withCredentials: true
        });
        
        // 응답 디버깅용 로그
        console.log('백엔드 응답 데이터:', response.data);

        if (response.data && response.data.studies) {
          setStudyGroups(response.data.studies);
        } else {
          setStudyGroups([]);
        }
        setError(null);
      } catch (err) {
        console.error("스터디 조회 중 오류 발생:", err);
        setError(
          "스터디를 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudies();
  }, [selectedCategory]); // 카테고리가 변경되면 다시 호출

  return (
    <Layout>
      <div className="py-12">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                스터디 찾기
              </h1>
              <p className="mt-2 text-gray-500">
                현재 모집 중인 스터디 그룹을 찾아보세요.
              </p>
            </div>
            <Link
              to="/create"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
            >
              새 스터디 만들기
            </Link>
          </div>

          {/* 인기 카테고리 섹션 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">인기 스터디 카테고리</h2>
            <div className="flex flex-wrap gap-2">
              {popularCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    // URL 파라미터 업데이트
                    navigate(`?category=${encodeURIComponent(category)}`, { replace: true });
                  }}
                  className={`px-3 py-1 rounded-full border transition-all ${selectedCategory === category
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400'}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">스터디를 불러오는 중...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-red-500">{error}</p>
            </div>
          ) : studyGroups.length === 0 ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">등록된 스터디가 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studyGroups.map((group) => (
                <StudyCard key={group.id} study={group} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default BrowseStudyGroups;
