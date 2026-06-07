import { SocialButton } from '../atoms/SocialButton'

export function SocialLogins() {
  return (
    <div className="flex justify-center gap-4">
      <SocialButton
        src="/github.png"
        alt="Logo do GitHub"
        label="Github"
        onClick={() => console.log('GitHub login')}
      />
      <SocialButton
        src="/gmail.png"
        alt="Logo do Gmail"
        label="Gmail"
        onClick={() => console.log('Gmail login')}
      />
    </div>
  )
}
