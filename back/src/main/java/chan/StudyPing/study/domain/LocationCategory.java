package chan.StudyPing.study.domain;

public enum LocationCategory {
    ONLINE("온라인"),    OFFLINE("오프라인"),    BOTH("온/오프라인 혼합");

    private final String description;

    LocationCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
