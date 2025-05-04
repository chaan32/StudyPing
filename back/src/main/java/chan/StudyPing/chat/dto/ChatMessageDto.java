package chan.StudyPing.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    private String content;
    private String senderEmail;
    private String senderName;
    private Long senderId;
    private Long roomId;
    private LocalDateTime timestamp;
}
