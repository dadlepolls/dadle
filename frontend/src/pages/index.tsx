import { useQuery } from "@apollo/client";
import { GET_POLLS_OVERVIEW } from "@operations/queries/GetPollsOverview";
import { GetPollsOverview } from "@operations/queries/__generated__/GetPollsOverview";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const { loading, data, error } =
    useQuery<GetPollsOverview>(GET_POLLS_OVERVIEW);
  if (loading) return <div>"loading..."</div>;
  if (error) return <div>An Error occured: {JSON.stringify(error)}</div>;

  return <div>{JSON.stringify(data)}</div>;
};

export default Home;
