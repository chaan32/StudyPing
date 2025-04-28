import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import StudyCard from "../components/StudyCard";
import { useState, useEffect } from "react";
import axios from "axios";

function BrowseStudyGroups() {
  const [studyGroups, setStudyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        // accessToken이 있을 때만 요청 전송
        const response = await axios.get("/study/find/all", {
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
  }, []);

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
