import styled from "@emotion/styled"
import Circle from "mdi-react/CircleIcon"
import Pause from "mdi-react/PauseIcon"
import PlayArrow from "mdi-react/PlayArrowIcon"
import { observer } from "mobx-react-lite"
import { FC } from "react"
import { Localized } from "../../components/Localized"
import { useToast } from "../../main/hooks/useToast"
import { CloudSong } from "../../repositories/ICloudSongRepository"
import { playSong } from "../actions/song"
import { formatTimeAgo } from "../helpers/formatTimeAgo"
import { useStores } from "../hooks/useStores"

const Content = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`

const Username = styled.div`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.secondaryTextColor};
  font-size: 90%;
`

const Title = styled.div`
  font-weight: 600;
  font-size: 130%;
`

const PlayButtonWrapper = styled.div`
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  align-content: center;
  justify-content: center;
  margin-right: 0.5rem;

  .arrow {
    display: none;
  }
  .circle {
    display: block;
    width: 0.5rem;
    opacity: 0.2;
  }
`

const PlayButton: FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  return (
    <PlayButtonWrapper>
      {isPlaying ? (
        <Pause />
      ) : (
        <>
          <Circle className="circle" />
          <PlayArrow className="arrow" />
        </>
      )}
    </PlayButtonWrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  padding: 0.5rem 0;
  cursor: pointer;
  border-radius: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.highlightColor};

    .arrow {
      display: block;
    }
    .circle {
      display: none;
    }
  }
`

const Time = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.2rem;
  margin-right: 1rem;
  color: ${({ theme }) => theme.secondaryTextColor};
`

const Tag = styled.div`
  display: flex;
  align-items: center;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  background: ${({ theme }) => theme.highlightColor};
  color: ${({ theme }) => theme.textColor};
  font-size: 90%;
  margin-right: 0.5rem;
`

export interface SongListItemProps {
  song: CloudSong
}

export const SongListItem: FC<SongListItemProps> = observer(({ song }) => {
  const rootStore = useStores()
  const {
    player,
    songStore: { currentSong },
  } = rootStore
  const toast = useToast()

  const isPlaying = player.isPlaying && currentSong?.metadata.id === song.id
  const onClick = () => {
    if (player.isPlaying && currentSong?.metadata.id === song.id) {
      player.stop()
    } else {
      try {
        playSong(rootStore)(song)
      } catch (e) {
        toast.error(`Failed to play: ${(e as Error).message}`)
      }
    }
  }

  return (
    <Wrapper onClick={onClick}>
      <PlayButton isPlaying={isPlaying} />
      <Content>
        <div style={{ marginRight: "1rem" }}>
          <Title>
            {song.name.length > 0 ? (
              song.name
            ) : (
              <Localized default="Untitled song">untitled-song</Localized>
            )}
          </Title>
          <Username>{song.user?.name}</Username>
        </div>
        {!song.isPublic && <Tag>Private</Tag>}
      </Content>
      <Time>{formatTimeAgo(song.updatedAt)}</Time>
    </Wrapper>
  )
})
