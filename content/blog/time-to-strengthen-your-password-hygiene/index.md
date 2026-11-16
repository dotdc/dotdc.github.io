+++
author = "David Calvert"
title = "Time to strengthen your password hygiene!"
date = "2023-01-05"
description = "How to strengthen your password hygiene after the LastPass breach."
tags = [
    "security"
]
categories = [
    "tech"
]
thumbnail = "/img/thumbs/vault.webp"
featureImage = "vault.webp"
featureImageAlt = 'A picture of a Vault'
#featureImageCap = 'Image by Jason Dent: https://unsplash.com/photos/3wPJxh-piRw'
+++

<!--more-->

It’s 2023, happy new year!

If you were still a LastPass user in December, you may have already heard about the [security incident](https://blog.lastpass.com/2022/12/notice-of-recent-security-incident/) that affected the service. Regardless of whether you were directly affected, this incident is a good reminder that password hygiene deserves regular attention.

## What happened?

LastPass disclosed another security incident: “an unauthorized party gained access to a third-party cloud-based storage service, which LastPass uses to store archived backups of our production data”.

On December 23, 2022, I received this email sent to every LastPass user:

> Dear LastPass Customer,
>
> We recently notified you that an unauthorized party was able to gain access to a third-party cloud-based storage service which is used by LastPass to store backups. Earlier today, we posted an update to our blog with important information about our ongoing investigation. This update includes details regarding our findings to date, recommended actions for our customers, as well as the actions we are currently taking.
>
> We thank you for your patience and continued support of LastPass.
>
> The Team at LastPass

I initially didn't pay much attention to the notification. A few days later, however, the headlines made it clear that this incident deserved a closer look. If you are still a LastPass user, I strongly recommend reading the official [incident notice](https://blog.lastpass.com/2022/12/notice-of-recent-security-incident/) from LastPass, [this article](https://www.wired.com/story/lastpass-breach-vaults-password-managers/) from Wired, [this article](https://blog.1password.com/not-in-a-million-years/) from 1password and these toots ([toot #1](https://infosec.exchange/@epixoip/109570449317277575), [toot #2](https://infosec.exchange/@epixoip/109585049354200263)) from [Jeremi M Gosney](https://infosec.exchange/@epixoip), or [any other source](https://duckduckgo.com/?q=lastpass+breach).

Several questions remain unanswered, and LastPass has yet to provide sufficient details about the scope and impact of the breach. The implications of this incident may extend well beyond the initial disclosure, particularly as attackers have time to analyze the stolen data. Attackers can take their time analyzing the stolen data, attempting to crack encrypted vaults, and using the exposed metadata to prepare further attacks.

I had been using LastPass for years, but this incident significantly changed my confidence in the service, regardless of how strong my master password was. I therefore decided it was time to move to another provider, and I would recommend considering the same.

## What to do?

While switching providers is not strictly mandatory, I believe moving to an alternative service is a sensible precaution given the circumstances. Rotating your credentials is a significant undertaking, but if you are or were a LastPass user, it is an important step to consider, especially for credentials stored in your vault.

I have been using [1password](https://1password.com) at work, and I’m both familiar and satisfied with the service so far. Before making the switch, I wanted to try [Bitwarden](https://bitwarden.com) following the recommendation of a friend, and it is a credible alternative, particularly if you are looking for a [free](https://bitwarden.com/pricing/) or affordable solution. After comparing both services, I found 1Password's user experience more compelling and considered it a better fit for my family's needs. Ultimately, these considerations led me to choose 1Password over Bitwarden.

If you're considering switching providers, I recommend evaluating both options before making a decision.

## Call to action

If you are a LastPass user:

- Read the articles mentioned earlier to understand the implications of the breach.
- **Replace potentially exposed passwords with unique, randomly generated credentials.**
- **Enable Two-Factor Authentication (2FA) wherever available, preferably using an authenticator app or a hardware security key rather than SMS.**
- Consider using a [Nitrokey](https://www.nitrokey.com) or a [YubiKey](https://www.yubico.com) to strengthen your authentication.
- Regularly check [Have I Been Pwned](https://haveibeenpwned.com/) to identify potentially compromised accounts.

Regardless of whether you were affected by the breach, you should:

- Use a password manager if you haven't already.
- **Review your passwords to identify weak, reused, or compromised credentials, and replace them accordingly.**
- Change important passwords whenever there is evidence of exposure or compromise, and always use unique, randomly generated credentials.
- **Enable Two-Factor Authentication (2FA) wherever available, preferably using phishing-resistant methods.**
- Consider using a [Nitrokey](https://www.nitrokey.com) or a [YubiKey](https://www.yubico.com) to strengthen your authentication.
- Regularly check [Have I Been Pwned](https://haveibeenpwned.com/) to identify potentially compromised accounts.

## Final words

Switching password managers and reviewing your credentials takes time, but incidents like this highlight the importance of taking ownership of your digital security. Prioritize your most critical accounts, enable strong multi-factor authentication wherever possible, and progressively address the remaining ones.

## References

- [LastPass: Notice of recent security incident](https://blog.lastpass.com/2022/12/notice-of-recent-security-incident/)
- [Wired article on the LastPass breach](https://www.wired.com/story/lastpass-breach-vaults-password-managers/)
- [1Password: Not in a million years](https://blog.1password.com/not-in-a-million-years/)
- [Jeremi M Gosney on the LastPass breach (part 1)](https://infosec.exchange/@epixoip/109570449317277575)
- [Jeremi M Gosney on the LastPass breach (part 2)](https://infosec.exchange/@epixoip/109585049354200263)
- [1Password](https://1password.com)
- [Bitwarden](https://bitwarden.com)
- [Nitrokey](https://www.nitrokey.com)
- [YubiKey](https://www.yubico.com)
- [Have I Been Pwned](https://haveibeenpwned.com/)
