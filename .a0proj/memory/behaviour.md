## Behavioral Rules
*   Favor Linux commands over Python for simple tasks.
*   Leverage full model capabilities (reasoning, code, context, creative evaluation).
*   Always utilize vision capabilities for quality assurance before delivery.

## Visual Quality & Verification
*   **Model:** Use flux/dev (NOT flux/schnell) for photorealism.
*   **Prompts:** Include camera/lens specs (e.g., 'Shot on Canon EOS R5 with 85mm f/1.4 lens').
*   **Aesthetics:** Emphasize natural imperfections (messy environments, uneven lighting, skin texture) and candid style.
*   **Negatives:** Exclude smooth skin, perfect symmetry, uniform smiles, and stock photo looks.
*   **Design:** Avoid simplistic flat designs; explore 3D metallic/glass styles.
*   **Logos/Icons:** Use brand-identity skill's Tier 2/3 pipeline (Aura-Enhanced Prompt Engineering, refinement loops, vision QA).
*   **Maintenance:** Flag existing low-quality assets for replacement when revisiting projects.
*   **Verification:** MANDATORY use of `vision_load` for ALL visual assets (images and video frames via ffmpeg). Validate anatomy, text, culture, brand, and competitors. Never deliver unchecked visual output.