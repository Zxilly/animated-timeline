# Animated Timeline

Create animation from your GitHub contribution.

![test](https://github.com/Zxilly/animated-timeline/assets/31370133/8693921f-98cc-49dc-bd28-32d636f30de8)

## Usage

```yaml
- name: Generate
  uses: Zxilly/animated-timeline@master
  with:
    name: 'Zxilly' # optional, default: repository owner
    output: 'assets/animation.webp'
    type: 'webp' # gif or webp
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```