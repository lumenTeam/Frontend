# recommend.py
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity

# load data
plans = pd.read_csv('plans.csv')    # plan_id, name, type, speed, quota, price
usage = pd.read_csv('usage.csv')    # user_id, avg_speed_used, avg_monthly_gb, budget

def prepare_plans(plans_df):
    # numeric features we use for matching
    df = plans_df.copy()
    df['speed'] = df['speed'].fillna(0)
    df['quota'] = df['quota'].fillna(0)
    df['price'] = df['price'].fillna(df['price'].mean())
    features = df[['speed','quota','price']].astype(float)
    scaler = MinMaxScaler()
    features_scaled = scaler.fit_transform(features)
    return df, features_scaled, scaler

def prepare_user_vector(user_row, scaler):
    vec = np.array([[user_row['avg_speed_used'], user_row['avg_monthly_gb'], user_row['budget']]])
    vec_scaled = scaler.transform(vec)
    return vec_scaled

def recommend_for_user(user_id, top_n=3):
    user_row = usage[usage.user_id == user_id]
    if user_row.empty:
        raise ValueError("User not found")

    df_plans, plan_feats, scaler = prepare_plans(plans)
    user_vec = prepare_user_vector(user_row.iloc[0], scaler)

    sims = cosine_similarity(user_vec, plan_feats)[0]
    df_plans['score'] = sims
    df_sorted = df_plans.sort_values('score', ascending=False)
    return df_sorted[['plan_id','name','type','speed','quota','price','score']].head(top_n)

if __name__ == "__main__":
    # demo: recommend for user 1
    print("Top recommendations for user 1:\n")
    print(recommend_for_user(1, top_n=3).to_string(index=False))
