# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e4]:
    - link "Story Magic" [ref=e5] [cursor=pointer]:
      - /url: /
      - img [ref=e6]
      - generic [ref=e8]: Story Magic
    - main [ref=e9]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - img [ref=e15]
          - heading "Welcome Back" [level=3] [ref=e17]
          - paragraph [ref=e18]: Sign in to continue creating stories
        - generic [ref=e19]:
          - button "Continue with Google" [ref=e20]:
            - img [ref=e21]
            - text: Continue with Google
          - generic [ref=e29]: Or continue with
          - generic [ref=e30]:
            - generic [ref=e31]:
              - text: Email
              - textbox "Email" [ref=e32]:
                - /placeholder: you@example.com
            - generic [ref=e33]:
              - text: Password
              - textbox "Password" [ref=e34]:
                - /placeholder: Enter your password
            - button "Sign In" [ref=e35]
        - paragraph [ref=e37]:
          - text: Don't have an account?
          - link "Sign up" [ref=e38] [cursor=pointer]:
            - /url: /register
  - region "Notifications (F8)":
    - list
  - button "Open Next.js Dev Tools" [ref=e44] [cursor=pointer]:
    - img [ref=e45]
  - alert [ref=e48]
  - iframe [ref=e49]:
    
```