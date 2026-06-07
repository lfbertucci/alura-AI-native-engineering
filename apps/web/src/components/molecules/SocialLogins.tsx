import { SocialButton } from '../atoms/SocialButton'

interface SocialLoginsProps {
  onGithubClick?: () => void
  onGmailClick?: () => void
}

export function SocialLogins({ onGithubClick, onGmailClick }: SocialLoginsProps) {
  return (
    <div className="flex justify-center gap-4">
      <SocialButton
        src="/github.png"
        alt="Logo do GitHub"
        label="Github"
        onClick={onGithubClick}
      />
      <SocialButton
        src="/gmail.png"
        alt="Logo do Gmail"
        label="Gmail"
        onClick={onGmailClick}
      />
    </div>
  )
}
