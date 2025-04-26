import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

function ProfileSection() {
  const { isLoggedIn, user, authRequest } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 로그인된 경우에만 프로필 데이터 가져오기
    if (isLoggedIn && user) {
      fetchProfileData();
    }
  }, [isLoggedIn, user]);

  // 인증이 필요한 API 요청 예제
  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);

    try {
      // AuthContext에서 제공하는 authRequest 함수 사용
      // 이 함수는 자동으로 Authorization 헤더에 토큰을 포함시킴
      const data = await authRequest(`/member/${user.id}`);
      setProfileData(data);
    } catch (err) {
      console.error("프로필 데이터 가져오기 실패:", err);
      setError("프로필 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <div>로그인이 필요합니다.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">사용자 프로필</h2>
      
      {loading && <div>로딩 중...</div>}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {profileData ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {user.avatar}
            </div>
            <div>
              <h3 className="font-medium">{profileData.name}</h3>
              <p className="text-sm text-gray-500">{profileData.email}</p>
            </div>
          </div>
          
          {/* 추가 프로필 정보 */}
          {profileData.bio && (
            <p className="text-gray-700 mt-2">{profileData.bio}</p>
          )}
        </div>
      ) : (
        !loading && !error && <div>프로필 정보가 없습니다.</div>
      )}
      
      <button 
        onClick={fetchProfileData} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        정보 새로고침
      </button>
    </div>
  );
}

export default ProfileSection;
