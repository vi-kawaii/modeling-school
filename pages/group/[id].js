import Head from "next/head";
import Header from "../../components/Header";
import Content from "../../components/Content";
import {
  ArchiveBoxArrowDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  EllipsisHorizontalIcon,
  LinkIcon,
  PlusIcon,
  UserMinusIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import ReactLinkify from "react-linkify";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSessionContext } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";
import useSWR from "swr";
import api from "../../utils/api";
import fetcher from "../../utils/fetcher";
import TextareaAutosize from "react-textarea-autosize";
import { formatRelative } from "date-fns";
import russianLocale from "date-fns/locale/ru";
import { toast } from "react-toastify";

export default function Group() {
  const [_origin, setOrigin] = useState("");
  const { isLoading, session, supabaseClient } = useSessionContext();
  const router = useRouter();
  const { id } = router.query;
  const [postText, setPostText] = useState("");
  const [loading, setLoading] = useState(false);

  const changePostText = ({ target: { value } }) => setPostText(value);

  const join = async () => {
    mutateMembers(
      [...members, { id: "", user_id: session.user.id, group_id: id }],
      false
    );

    await supabaseClient
      .from("members")
      .insert([{ user_id: session.user.id, group_id: id }]);
  };

  const leave = async () => {
    mutateMembers(
      members.filter((m) => m.user_id !== session.user.id),
      false
    );

    await supabaseClient
      .from("members")
      .delete()
      .eq("user_id", session.user.id)
      .eq("group_id", id);
  };

  const createPost = async () => {
    setLoading(true);

    await supabaseClient
      .from("posts")
      .insert([{ text: postText, group_id: id }]);

    mutate();

    setLoading(false);
    setPostText("");
  };

  const addToArchive = async (post_id) => {
    await supabaseClient
      .from("archive")
      .insert([{ user_id: session.user.id, post_id }]);
    toast.success("Запись сохранена в архиве", {
      position: "bottom-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: false,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: "light",
      closeButton: false,
      className: "bottom-14 sm:bottom-auto m-2",
    });
  };

  const shareGroup = () => {
    navigator.share({ url: location.href });
  };

  const sharePost = (id) => {
    navigator.share({ url: `${origin}/post/${id}` });
  };

  const { data } = useSWR(
    !isLoading && session ? api(`groups?id=eq.${id}`, session) : null,
    fetcher
  );

  const { data: posts, mutate } = useSWR(
    !isLoading && session
      ? api(`posts?group_id=eq.${id}&order=created_at.desc`, session)
      : null,
    fetcher
  );

  const { data: members, mutate: mutateMembers } = useSWR(
    !isLoading && session
      ? api(`members?group_id=eq.${id}&select=*`, session)
      : null,
    fetcher
  );

  useEffect(() => {
    if (!isLoading && !session) {
      router.replace("/");
    }
  }, [session, router, isLoading]);

  useEffect(() => {
    setOrigin(origin);
  }, []);

  if (isLoading || !session) {
    return null;
  }

  return (
    <>
      <Content>
        <Header home homePage />
        {!data || !posts || !members ? (
          <>
            <div className="flex items-center text-xl font-bold pl-4 pb-4 bg-neutral-900 rounded-b-2xl">
              <Link href="/home">
                <a className="inline-block -my-1 mr-2 -ml-2 sm:hover:bg-neutral-700 p-2 rounded-full">
                  <ChevronLeftIcon className="w-6" />
                </a>
              </Link>
            </div>
            <div className="flex items-center mt-2">
              <div className="m-4 w-[40px] h-[40px] bg-neutral-900 rounded-full"></div>
              <div className="space-y-2">
                <div className="text-xl bg-neutral-900 w-56 rounded-full">
                  &nbsp;
                </div>
                <div className="bg-neutral-900 w-48 rounded-full">&nbsp;</div>
              </div>
            </div>
            <div className="mx-4 bg-neutral-900 rounded-full w-56 mt-2">
              &nbsp;
            </div>
            <div className="flex gap-2 px-2">
              <div className="h-10 w-full flex justify-center bg-neutral-900 font-medium rounded-2xl text-sm px-3 py-2 my-2"></div>
              <div className="h-10 w-full flex justify-center bg-neutral-900 font-medium rounded-2xl text-sm px-3 py-2 my-2"></div>
            </div>
            <div className="space-y-2">
              <div className="bg-neutral-900 h-36 rounded-2xl"></div>
              <div className="bg-neutral-900 h-36 rounded-2xl"></div>
              <div className="bg-neutral-900 h-36 rounded-2xl"></div>
              <div className="bg-neutral-900 h-36 rounded-2xl"></div>
            </div>
          </>
        ) : (
          <>
            <Head>
              <title>{data[0].name} - Школа моделирования</title>
            </Head>
            <div className="flex items-center text-xl font-bold pl-4 pb-4 bg-neutral-900 rounded-b-2xl">
              <Link href="/home">
                <a className="inline-block -my-1 mr-2 -ml-2 sm:hover:bg-neutral-700 p-2 rounded-full">
                  <ChevronLeftIcon className="w-6" />
                </a>
              </Link>
            </div>
            <div className="pr-2 mt-2 bg-neutral-900 rounded-2xl">
              <div className="flex items-center">
                <div className="p-4 shrink-0">
                  <Image
                    alt=""
                    width={40}
                    height={40}
                    src={`https://avatars.dicebear.com/api/identicon/${id}.svg`}
                  />
                </div>
                <div>
                  <h1 className="text-xl">{data[0].name}</h1>
                  <div className="text-neutral-500">
                    Участников: {members.length}
                  </div>
                </div>
              </div>
              {data[0].description && (
                <div className="mx-4 pb-4">{data[0].description}</div>
              )}
            </div>
            <div className="px-2 flex gap-2">
              {session.user.id !== data[0].owner_id &&
                (members.find(
                  (m) => m.user_id === session.user.id && m.group_id === id
                ) ? (
                  <button
                    onClick={leave}
                    className="w-full flex justify-center bg-neutral-800 font-medium rounded-2xl text-sm px-3 py-2 my-2"
                  >
                    <UserMinusIcon className="w-6 mr-2" />
                    <div className="leading-6">Покинуть</div>
                  </button>
                ) : (
                  <button
                    onClick={join}
                    className="w-full flex justify-center bg-white text-black font-medium rounded-2xl text-sm px-3 py-2 my-2"
                  >
                    <UserPlusIcon className="w-6 mr-2" />
                    <div className="leading-6">Присоединиться</div>
                  </button>
                ))}
              <button
                onClick={shareGroup}
                className={`flex ${
                  session.user.id !== data[0].owner_id
                    ? "w-fit sm:w-full"
                    : "w-full"
                } justify-center bg-neutral-800 font-medium rounded-2xl text-sm px-3 py-2 my-2`}
              >
                <LinkIcon
                  className={`w-6 ${
                    session.user.id !== data[0].owner_id ? "sm:mr-2" : "mr-2"
                  }`}
                />
                <div
                  className={`leading-6 ${
                    session.user.id !== data[0].owner_id
                      ? "hidden sm:block"
                      : ""
                  }`}
                >
                  Поделиться
                </div>
              </button>
            </div>
            {session.user.id === data[0].owner_id && (
              <div className="px-2 mb-2">
                <TextareaAutosize
                  disabled={loading}
                  placeholder="Напишите что-нибудь..."
                  className="block w-full px-3 py-2 rounded-2xl resize-none bg-neutral-700"
                  value={postText}
                  onChange={changePostText}
                />
                {postText.trim() && !loading && (
                  <button
                    onClick={createPost}
                    className="w-full flex justify-center bg-white text-black font-medium rounded-2xl text-sm px-3 py-2 my-2"
                  >
                    <CheckIcon className="w-6 mr-2" />
                    <div className="leading-6">Опубликовать</div>
                  </button>
                )}
                {loading && (
                  <div className="w-full flex justify-center bg-neutral-900 font-medium rounded-2xl text-sm px-3 py-2 my-2">
                    <EllipsisHorizontalIcon className="w-6 mr-2" />
                    <div className="leading-6">Публикуем запись</div>
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2 mb-8">
              {posts &&
                (posts.length === 0 ? (
                  <div className="text-center text-neutral-500 mt-10">
                    Нет записей
                  </div>
                ) : (
                  posts.map((p) => (
                    <div
                      className="bg-neutral-900 rounded-2xl py-1 px-4"
                      key={p.id}
                    >
                      <div>
                        <div className="flex gap-4">
                          <Link href={`/group/${id}`}>
                            <a className="mt-4 ml-2">
                              <Image
                                alt=""
                                width={30}
                                height={30}
                                src={`https://avatars.dicebear.com/api/identicon/${id}.svg`}
                              />
                            </a>
                          </Link>
                          <div>
                            <Link href={`/group/${id}`}>
                              <a className="mt-2 inline-block">
                                {data[0].name}
                              </a>
                            </Link>
                            <div className="text-neutral-500">
                              {formatRelative(
                                new Date(p.created_at),
                                new Date(),
                                { locale: russianLocale }
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="py-2 rounded-2xl pr-6 whitespace-pre-wrap">
                          <ReactLinkify
                            componentDecorator={(href, text, key) =>
                              href.startsWith(_origin) ? (
                                <Link href={href} key={key}>
                                  <a className="text-blue-500">{text}</a>
                                </Link>
                              ) : (
                                <a
                                  target="_blank"
                                  rel="noreferrer"
                                  href={href}
                                  key={key}
                                  className="text-blue-500"
                                >
                                  {text}
                                </a>
                              )
                            }
                          >
                            {p.text}
                          </ReactLinkify>
                        </div>
                      </div>
                      <div className="flex justify-between mb-2 mt-2">
                        <button
                          title="Добавить в архив"
                          onClick={() => addToArchive(p.id)}
                          className="p-2 -m-2 sm:hover:bg-neutral-700 rounded-full"
                        >
                          <ArchiveBoxArrowDownIcon className="w-6" />
                        </button>
                        <button
                          title="Поделиться записью"
                          onClick={() => sharePost(p.id)}
                          className="p-2 -m-2 ml-2 sm:hover:bg-neutral-700 rounded-full"
                        >
                          <LinkIcon className="w-6" />
                        </button>
                      </div>
                    </div>
                  ))
                ))}
            </div>
          </>
        )}
      </Content>
    </>
  );
}
