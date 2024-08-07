import { FaSquareXTwitter } from "react-icons/fa6";
import { FaMastodon } from "react-icons/fa";
import { SiMisskey } from "react-icons/si";
import { FaRegCopy } from "react-icons/fa";
import { CiShare2 } from "react-icons/ci";

interface ShareButtonsProps {
    currentURL: string;
    postTitle: string;
}

interface ShareButton {
    name: string;
    icon: JSX.Element;
    url: string;
    bgColor: string;
}

export default function ShareButtons({ currentURL, postTitle }: ShareButtonsProps) {
    const socialShareText = encodeURIComponent(`${postTitle}-現実モデリング`);
    const url = new URL(currentURL);
    const hatenaBlogUrl = url.hostname + url.pathname;
    const copy = async (currentURL: string) => {
        await navigator.clipboard.writeText(currentURL);
    }

    const invokeShareAPI = async (currentURL: string, postTitle: string) => {
        try {
            await navigator.share({ url: currentURL, title: postTitle });
        } catch (error) {
            console.error("シェアAPIが使えませんでした", error);
        }
    }

    const shareButtons: ShareButton[] = [
        {
            name: 'Twitter',
            icon: <FaSquareXTwitter style={{ fill: "white" }} />,
            url: `https://twitter.com/intent/tweet?text=${socialShareText}&url=${encodeURIComponent(currentURL)}`,
            bgColor: 'bg-black'
        },
        {
            name: 'Mastodon',
            icon: <FaMastodon style={{ fill: "white" }} />,
            url: `https://donshare.net/share.html?text=${socialShareText}&url=${encodeURIComponent(currentURL)}`,
            bgColor: 'bg-violet-800'
        },
        {
            name: 'Misskey',
            icon: <SiMisskey style={{ fill: "green" }} />,
            url: `https://misskeyshare.link/share.html?text=${socialShareText}&url=${encodeURIComponent(currentURL)}`,
            bgColor: 'bg-green-200'
        }
    ];


    return (
        <div className="flex justify-center items-center space-x-4">
           <button type="button" className="p-0 overflow-hidden rounded-lg">
                <a
                    href="https://b.hatena.ne.jp/entry/"
                    className="hatena-bookmark-button block"
                    data-hatena-bookmark-layout="vertical-normal"
                    data-hatena-bookmark-lang="ja"
                    title="このエントリーをはてなブックマークに追加"
                >
                    <img
                        src="https://b.st-hatena.com/images/v4/public/entry-button/button-only@2x.png"
                        alt="このエントリーをはてなブックマークに追加"
                        width="20"
                        height="20"
                        style={{ border: 'radius' }}
                    />
                </a>
            </button>
            {shareButtons.map((button) => (
                    <button key={button.name} type="button" className={`${button.bgColor} flex items-center justify-center space-x-2 px-4 py-2 rounded-full`}>
                        <a href={button.url} className="flex items-center">
                            {button.icon}
                        </a>
                    </button>
            ))}
            <div className="tooltip" data-tip ="URLをクリップボードにコピー">
                <button 
                    type="button" 
                    onClick={() => copy(currentURL)}
                    className="hover:bg-base-300 rounded-full p-2 transition-colors duration-300"
                >
                    <FaRegCopy />
                </button>
            </div>
            <div className="tooltip" data-tip ="シェアする">
                <button type="button" onClick={() => invokeShareAPI(currentURL, postTitle)} className="hover:bg-base-300 rounded-full p-2 transition-colors duration-300">
                    <CiShare2 />
                </button>
            </div>

        </div>
    );
}
