# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "Sign in to your account" [level=2] [ref=e6]
    - paragraph [ref=e7]:
      - text: Or
      - link "create a new account" [ref=e8] [cursor=pointer]:
        - /url: /register
  - generic [ref=e9]:
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Email address
        - textbox "Email address" [ref=e13]: demo@uptime-monitor.com
      - generic [ref=e14]:
        - generic [ref=e15]: Password
        - textbox "Password" [ref=e16]: demo123
    - generic [ref=e17]:
      - generic [ref=e18]:
        - checkbox "Remember me" [ref=e19]
        - generic [ref=e20]: Remember me
      - link "Forgot your password?" [ref=e22] [cursor=pointer]:
        - /url: /forgot-password
    - button "Sign in" [ref=e24] [cursor=pointer]
    - generic [ref=e25]:
      - generic [ref=e30]: Demo credentials
      - generic [ref=e31]:
        - paragraph [ref=e32]: "Email: demo@uptime-monitor.com"
        - paragraph [ref=e33]: "Password: demo123"
```