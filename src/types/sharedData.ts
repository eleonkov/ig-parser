export enum SharedDataType {
  GraphSidecar = 'GraphSidecar',
  GraphVideo = 'GraphVideo',
}

export type SharedData = {
  __typename: SharedDataType
}

export type SharedDataOutput = {
  timestamp: number
  likes: number
  shortcode: string
}
