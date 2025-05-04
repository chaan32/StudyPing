package chan.StudyPing.common.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class JwtAuthFilter extends GenericFilter {
    @Value("${jwt.secretKey}")
    private String secretKey;

    // Define permitAll paths based on SecurityConfigs
    private final List<String> permitAllPaths = Arrays.asList("/test", "/member/login", "/member/create", "/connect");

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpServletRequest = (HttpServletRequest) request;
        HttpServletResponse httpServletResponse = (HttpServletResponse) response;
        String requestURI = httpServletRequest.getRequestURI();

        // Check if the request path should bypass authentication
        boolean isPermitAllPath = permitAllPaths.stream().anyMatch(path -> requestURI.startsWith(path));

        if (isPermitAllPath) {
            chain.doFilter(request, response); // Bypass JWT validation for permitAll paths
            return;
        }

        String token = httpServletRequest.getHeader("Authorization");

        try{
            if (token != null){ // 토큰이 있는 경우 (and path requires authentication)
                if (!token.substring(0, 7).equals("Bearer ")){
                    log.info("input token : {}", token);
                    throw new AuthenticationServiceException("Bearer 형식이 ㄴㄴ");
                }
                String jwtToken = token.substring(7); //Bearer 떼고 토큰의 원본만 꺼냄
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(secretKey)
                        .build()
                        .parseClaimsJws(jwtToken)
                        .getBody();

                //authentication 객체 생성
                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_" + claims.get("role").toString()));
                UserDetails userDetails = new User(claims.getSubject(), "", authorities);
                Authentication authentication = new UsernamePasswordAuthenticationToken(userDetails, "", userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authentication); //계층 구조
            }
            chain.doFilter(request, response);
        }
        catch (Exception e){
            // 토큰이 잘못된 경우
            e.printStackTrace();
            httpServletResponse.setStatus(HttpStatus.UNAUTHORIZED.value());
            httpServletResponse.setContentType("application/json");
            httpServletResponse.getWriter().write("invalid token");
        }
    }
}
