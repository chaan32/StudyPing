import { Link } from "react-router-dom"
import { MapPin, Calendar } from "./icons/Icons"

function StudyCard({ study }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-4 pb-3">
        <div className="flex justify-between items-start">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full border mb-2">
            {study.category}
          </span>
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-100">
            {study.currentParticipants}/{study.maxParticipants}명
          </span>
        </div>
        <h3 className="text-xl font-bold">{study.title}</h3>
      </div>
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-500 line-clamp-3 mb-4">{study.description}</p>
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{study.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>생성일: {study.createdAt}</span>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0">
        <Link
          to={`/study/${study.id}`}
          className="block w-full text-center py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
        >
          자세히 보기
        </Link>
      </div>
    </div>
  )
}

export default StudyCard
