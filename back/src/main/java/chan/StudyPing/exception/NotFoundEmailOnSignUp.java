package chan.StudyPing.exception;

public class NotFoundEmailOnSignUp extends Exception{
    public NotFoundEmailOnSignUp(String message) {
        super(message);
    }

    public NotFoundEmailOnSignUp(String message, Throwable cause) {
        super(message, cause);
    }

    public NotFoundEmailOnSignUp(Throwable cause) {
        super(cause);
    }

    public NotFoundEmailOnSignUp(String message, Throwable cause, boolean enableSuppression, boolean writableStackTrace) {
        super(message, cause, enableSuppression, writableStackTrace);
    }
}
