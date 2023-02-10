import glob from 'glob'

type LoaderFunction = (path: string) => any

export interface RavenLoaderConfig {
  root: string
  [section: string]: string | string[]
}

export class RavenLoader {
  private readonly loaders: Record<string, LoaderFunction> = {}

  addLoader(key: string, loader: LoaderFunction) {
    this.loaders[key] = loader
  }

  public load(config: RavenLoaderConfig) {
    const { root, ...sections } = config

    Object.keys(sections).forEach((section) => {
      if (!sections[section]) return
      if (!this.loaders[section]) throw new Error(`Loader not registered for ${section}`)

      const globs: string[] =
        typeof sections[section] === 'string' ? [sections[section] as string] : (sections[section] as string[])

      const files = globs.flatMap((p) => glob.sync(p, { cwd: root })).map((f) => (root ? `${root}/${f}` : f))

      this.loadFiles(section, files)
    })
  }

  private loadFiles(type: string, files: string[]) {
    const loader = this.loaders[type]

    files.forEach((file) => {
      try {
        module = loader(file)
      } catch (err: any) {
        console.error(`Error occured while loading ${file} as ${type}: ${err}`)
      }
    })
  }
}
