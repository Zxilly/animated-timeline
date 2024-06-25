# Animated Timeline

Create animation from your GitHub contribution.

![image](https://github.com/Zxilly/animated-timeline/assets/31370133/aea53992-5368-48d1-a0e8-f2d79c4dc0a3)

## Usage

```yaml
- name: Generate
  uses: Zxilly/animated-timeline@v1
  with:
    name: 'Zxilly' # optional
    output: 'assets/animation.webp'
    type: 'webp' # gif, webp or both
```

| Parameter | Description                                                                                                                  | Default               |
|-----------|------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| name      | Name displayed in the animation, by default it is the username of the token.                                                 | Username of the token |
| output    | Output file name, by default it is `animation.webp`. If it doesn't end with `.webp` or `.gif`, the type option will be used. | `animation.webp`      |
| type      | Output file type, can be `webp`, `gif`, or both. If omitted, it will be determined by the output file name.                  | (Empty string)        |
| token     | Personal access token (PAT) used.                                                                                            | `${{ github.token }}` |
| login     | The target user to fetch the contributions, by default it is the username of the token.                                      | Login of the token    |
| font      | Font file used in the animation, by default it is Noto Serif CJK SC.                                                         | Noto Serif CJK SC     |
