package chan.StudyPing.study.domain;

public enum StudyCategory {
    PROGRAMMING("프로그래밍"),
    LANGUAGE("외국어"),
    JOB("취업 준비"),
    CERTIFICATE("자격증"),
    READING("독서"),
    OTHER("기타");

    private final String description;

    StudyCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
