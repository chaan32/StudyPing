package chan.StudyPing.member.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;



@Controller
@Slf4j
public class TestController {
    @GetMapping("/test")
    @ResponseBody
    public String test() {
        log.info("들어왔다 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
        return "test"+"123";
    }
}
