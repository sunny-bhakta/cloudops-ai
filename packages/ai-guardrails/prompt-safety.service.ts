import { Injectable } from "@nestjs/common";

export interface PromptSafetyResult {
    allowed: boolean;
    reason?: string;
}

@Injectable()
export class PromptSafetyService {
    private readonly blockedPatterns = [
        /ignore\s+(all\s+)?previous\s+instructions?/i,
        /ignore\s+(all\s+)?prior\s+instructions?/i,
        /forget\s+(all\s+)?previous\s+instructions?/i,
        /system\s+prompt/i,
        /reveal\s+(the\s+)?system\s+prompt/i,
        /show\s+(me\s+)?your\s+system\s+prompt/i,
        /developer\s+mode/i,
        /bypass\s+(security|safety|permissions?)/i,
    ];

    check(input: string): PromptSafetyResult {
        const normalized = this.normalize(input);

        for (const pattern of this.blockedPatterns) {
            if (pattern.test(normalized)) {
                return {
                    allowed: false,
                    reason: 'Potential prompt injection detected',
                };
            }
        }

        return {
            allowed: true,
        };
    }

    private normalize(input: string): string {
        return input
            .normalize('NFKC')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .trim();
    }
}